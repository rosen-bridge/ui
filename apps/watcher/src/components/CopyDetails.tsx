import { Button } from '@rosen-bridge/ui-kit';

export const CopyDetails = ({ more }: { more?: () => string }) => {
  if (!more) return null;
  return (
    <>
      {' '}
      <Button
        color="inherit"
        size="small"
        variant="text"
        style={{ padding: '5px', lineHeight: 'normal' }}
        onClick={() => {
          navigator.clipboard.writeText(more());
        }}
      >
        Copy Details
      </Button>
    </>
  );
};
