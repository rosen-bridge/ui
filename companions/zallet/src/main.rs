use std::{env, fs};

use base64::{Engine, engine::general_purpose::STANDARD};
use pczt::roles::updater::Updater;

const ZIP317_MARGINAL_FEE: u64 = 5_000;
const ZIP317_GRACE_ACTIONS: usize = 2;
const ZIP317_P2PKH_INPUT_SIZE: usize = 150;
const ZIP317_P2PKH_OUTPUT_SIZE: usize = 34;

fn fail(message: impl Into<String>) -> Box<dyn std::error::Error> {
    message.into().into()
}

fn parse_zat(value: &str, name: &str) -> Result<u64, Box<dyn std::error::Error>> {
    if value.is_empty() || !value.bytes().all(|b| b.is_ascii_digit()) {
        return Err(fail(format!("{name} must be an unsigned decimal integer")));
    }
    value.parse::<u64>().map_err(|_| fail(format!("{name} exceeds u64")))
}

fn parse_hex(value: &str, name: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    if value.is_empty() || value.len() % 2 != 0 || !value.bytes().all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase()) {
        return Err(fail(format!("{name} must be non-empty canonical lowercase hex")));
    }
    hex::decode(value).map_err(|_| fail(format!("{name} is invalid hex")))
}

fn compact_size_len(value: usize) -> usize {
    match value {
        0..=252 => 1,
        253..=0xffff => 3,
        0x1_0000..=0xffff_ffff => 5,
        _ => 9,
    }
}

fn is_p2pkh(script: &[u8]) -> bool {
    script.len() == 25
        && script[0..3] == [0x76, 0xa9, 0x14]
        && script[23..25] == [0x88, 0xac]
}

fn validate_rosen_script(script: &[u8]) -> Result<(), Box<dyn std::error::Error>> {
    if script.len() != 53 || script[0] != 0x6a || script[1] != 0x33 {
        return Err(fail("Rosen output must be OP_RETURN followed by one exact 51-byte push"));
    }
    let payload = &script[2..];
    if payload[0] != 0 || payload[17] != 33 || !matches!(payload[18], 2 | 3) {
        return Err(fail("Rosen payload must target Ergo with one compressed P2PK key"));
    }
    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().skip(1).collect();
    if args.len() != 5 {
        return Err(fail("usage: transformer <input-pczt.b64> <output-pczt.b64> <placeholder-value-zat> <placeholder-script-hex> <rosen-script-hex>"));
    }
    let input_path = &args[0];
    let output_path = &args[1];
    let placeholder_value = parse_zat(&args[2], "placeholder value")?;
    let placeholder_script = parse_hex(&args[3], "placeholder script")?;
    let rosen_script = parse_hex(&args[4], "Rosen script")?;
    validate_rosen_script(&rosen_script)?;

    let encoded = fs::read_to_string(input_path)?;
    let pczt = pczt::parse(&STANDARD.decode(encoded.trim())?)?;
    if !pczt.sapling().spends().is_empty()
        || !pczt.sapling().outputs().is_empty()
        || !pczt.orchard().actions().is_empty()
        || !pczt.ironwood().actions().is_empty()
    {
        return Err(fail("Rosen transparent lock PCZT must not contain shielded actions"));
    }
    if pczt.transparent().inputs().is_empty() {
        return Err(fail("PCZT must contain at least one transparent input"));
    }
    if pczt.transparent().inputs().iter().any(|input| !is_p2pkh(input.script_pubkey())) {
        return Err(fail("ZIP-317 validation currently requires only P2PKH transparent inputs"));
    }

    let matches: Vec<usize> = pczt.transparent().outputs().iter().enumerate()
        .filter_map(|(index, output)| {
            (*output.value() == placeholder_value && output.script_pubkey() == placeholder_script.as_slice())
                .then_some(index)
        })
        .collect();
    if matches.len() != 1 {
        return Err(fail(format!("expected one exact placeholder output, found {}", matches.len())));
    }
    let selected = matches[0];

    let global_before = pczt.global().clone();
    let inputs_before = pczt.transparent().inputs().clone();
    let outputs_before = pczt.transparent().outputs().clone();
    let sapling_before = pczt.sapling().clone();
    let orchard_before = pczt.orchard().clone();
    let ironwood_before = pczt.ironwood().clone();
    let pczt = Updater::new(pczt)
        .replace_transparent_output(selected, 0, rosen_script.clone())
        .ok_or_else(|| fail("selected transparent output disappeared"))?
        .finish();

    if pczt.global() != &global_before
        || pczt.transparent().inputs() != inputs_before.as_slice()
        || pczt.sapling() != &sapling_before
        || pczt.orchard() != &orchard_before
        || pczt.ironwood() != &ironwood_before
        || pczt.transparent().outputs().len() != outputs_before.len()
        || pczt.transparent().outputs().iter().enumerate().any(|(index, output)| index != selected && output != &outputs_before[index])
    {
        return Err(fail("PCZT mutation changed data outside the selected placeholder output"));
    }
    let selected_output = &pczt.transparent().outputs()[selected];
    if *selected_output.value() != 0 || selected_output.script_pubkey() != rosen_script.as_slice()
        || selected_output.user_address().is_some() || !selected_output.proprietary().is_empty()
    {
        return Err(fail("selected output was not converted into a clean zero-value Rosen output"));
    }
    let nulldata = pczt.transparent().outputs().iter()
        .filter(|output| output.script_pubkey().first() == Some(&0x6a))
        .collect::<Vec<_>>();
    if nulldata.len() != 1 || *nulldata[0].value() != 0 || nulldata[0].script_pubkey() != rosen_script.as_slice() {
        return Err(fail("final PCZT must contain exactly one zero-value Rosen OP_RETURN"));
    }

    let input_total = pczt.transparent().inputs().iter().try_fold(0u64, |sum, input| sum.checked_add(*input.value()))
        .ok_or_else(|| fail("transparent input total overflow"))?;
    let output_total = pczt.transparent().outputs().iter().try_fold(0u64, |sum, output| sum.checked_add(*output.value()))
        .ok_or_else(|| fail("transparent output total overflow"))?;
    let actual_fee = input_total.checked_sub(output_total).ok_or_else(|| fail("transparent outputs exceed inputs"))?;
    let input_size = pczt.transparent().inputs().len() * ZIP317_P2PKH_INPUT_SIZE;
    let output_size = pczt.transparent().outputs().iter()
        .map(|output| 8 + compact_size_len(output.script_pubkey().len()) + output.script_pubkey().len())
        .sum::<usize>();
    let logical_actions = (input_size.div_ceil(ZIP317_P2PKH_INPUT_SIZE))
        .max(output_size.div_ceil(ZIP317_P2PKH_OUTPUT_SIZE));
    let conventional_fee = ZIP317_MARGINAL_FEE
        .checked_mul(ZIP317_GRACE_ACTIONS.max(logical_actions) as u64)
        .ok_or_else(|| fail("ZIP-317 fee overflow"))?;
    if actual_fee != conventional_fee {
        return Err(fail(format!("final fee {actual_fee} does not equal ZIP-317 conventional fee {conventional_fee}")));
    }

    let input_count = pczt.transparent().inputs().len();
    let output_count = pczt.transparent().outputs().len();
    let bytes = pczt.serialize().map_err(|e| fail(format!("failed to serialize PCZT: {e:?}")))?;
    fs::write(output_path, STANDARD.encode(bytes))?;
    println!("{}", serde_json::json!({
        "status": "transformed",
        "placeholderIndex": selected,
        "inputCount": input_count,
        "outputCount": output_count,
        "feeZat": actual_fee.to_string(),
        "zip317LogicalActions": ZIP317_GRACE_ACTIONS.max(logical_actions),
    }));
    Ok(())
}
