import {
  Button,
  Icon,
  Menu,
  MenuBody,
  MenuItem,
  MenuTrigger,
} from '@rosen-bridge/ui-kit';

const guards = [
  { key: '', label: 'Overall' },
  ...JSON.parse(process.env['NEXT_PUBLIC_ALLOWED_PKS'] ?? '[]'),
] as Array<{ key: string; label: string }>;

type ProcessSelectProps = {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const ProcessSelect = ({
  disabled,
  value,
  onChange,
}: ProcessSelectProps) => {
  return (
    <Menu>
      <MenuTrigger
        as={Button}
        disabled={disabled}
        endIcon={<Icon name="AngleDown" size="20px" />}
        size="small"
      >
        {guards.find((guard) => guard.key === value)?.label}
      </MenuTrigger>
      <MenuBody offset={[0, 4]} placement="bottom-start">
        {guards.map((guard) => (
          <MenuItem
            key={guard.key}
            selected={guard.key === value}
            onClick={() => onChange(guard.key)}
          >
            {guard.label}
          </MenuItem>
        ))}
      </MenuBody>
    </Menu>
  );
};
