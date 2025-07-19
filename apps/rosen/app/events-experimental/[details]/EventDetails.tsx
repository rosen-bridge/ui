export type EventDetailsProps = {
  id?: string;
};

export const EventDetails = ({ id }: EventDetailsProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        textAlign: 'center',
        fontSize: '24px',
      }}
    >
      coming soon.... id:{id}
    </div>
  );
};
