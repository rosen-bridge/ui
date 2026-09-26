use alloc::vec::Vec;

use transparent::pczt::{ParseError, Updater, UpdaterError};

use crate::Pczt;

impl super::Updater {
    /// Replaces one transparent output's transaction effect and clears metadata
    /// that described the previous recipient.
    pub fn replace_transparent_output(
        mut self,
        index: usize,
        value: u64,
        script_pubkey: Vec<u8>,
    ) -> Option<Self> {
        self.pczt
            .transparent
            .replace_output_effect(index, value, script_pubkey)
            .then_some(self)
    }

    /// Updates the transparent bundle with information in the given closure.
    pub fn update_transparent_with<F>(self, f: F) -> Result<Self, TransparentError>
    where
        F: FnOnce(Updater<'_>) -> Result<(), UpdaterError>,
    {
        let Pczt {
            global,
            transparent,
            sapling,
            orchard,
            ironwood,
        } = self.pczt;

        let mut bundle = transparent
            .into_parsed()
            .map_err(TransparentError::Parser)?;

        bundle.update_with(f).map_err(TransparentError::Updater)?;

        Ok(Self {
            pczt: Pczt {
                global,
                transparent: crate::transparent::Bundle::serialize_from(bundle),
                sapling,
                orchard,
                ironwood,
            },
        })
    }
}

/// Errors that can occur while updating the transparent bundle of a PCZT.
#[derive(Debug)]
pub enum TransparentError {
    Parser(ParseError),
    Updater(UpdaterError),
}
