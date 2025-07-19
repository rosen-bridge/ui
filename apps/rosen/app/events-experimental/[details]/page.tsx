import { EventDetails } from '@/events-experimental/[details]/EventDetails';

export default function DetailsPage({ params }: { params: any }) {
  return <EventDetails id={params.id} />;
}
