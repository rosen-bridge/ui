import { Drawer, useBreakpoint, useStickyBox } from '@rosen-bridge/ui-kit';

import { ApiEventResponse } from '@/_types';

export type DetailsProps = {
  value?: ApiEventResponse['items'][0];
  onClose: () => void;
};

const Content = ({ value }: Pick<DetailsProps, 'value'>) => {
  return <div>Details {value?.id}</div>;
};

export const Details = ({ value, onClose }: DetailsProps) => {
  const drawer = useBreakpoint('laptop-down');

  const stickyRef = useStickyBox({
    offsetTop: 16,
    offsetBottom: 16,
  });

  if (drawer) {
    return (
      <Drawer anchor="bottom" open={!!value} onClose={onClose}>
        <Content value={value} />
      </Drawer>
    );
  }

  return (
    <div
      ref={stickyRef}
      style={{
        height: '120vh',
        background: 'white',
        width: '330px',
        padding: '16px',
        borderRadius: '16px',
        marginLeft: '16px',
      }}
    >
      <Content value={value} />
    </div>
  );
};
