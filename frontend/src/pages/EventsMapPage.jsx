import { useQuery } from '@tanstack/react-query';
import { AppShell } from '../components/layout';
import { Card } from '../components/ui';
import { QueryBoundary } from '../components/feedback';
import { apiFetch } from '../lib/apiClient';
import EventMap from '../components/maps/EventMap';

export default function EventsMapPage() {
    const eventsQuery = useQuery({
        queryKey: ['events-map'],
        queryFn: () => apiFetch('/events/map'),
    });

    const { data, isLoading, isError } = eventsQuery;
    const events = data?.results ?? [];

    return (
        <AppShell
            title="Events Map"
            subtitle="Explore all events on an interactive map. Click markers to see event details."
        >
            <Card>
                <QueryBoundary query={eventsQuery} loadingLabel="Loading events map...">
                    {events.length === 0 ? (
                        <div className="flex h-[500px] items-center justify-center">
                            <p className="text-neutral/70">
                                No events with locations available to display on the map.
                            </p >
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-neutral/70">
                                    Showing {events.length} event{events.length !== 1 ? 's' : ''} on the map
                                </p >
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <span>Available</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                        <span>Full</span>
                                    </div>
                                </div>
                            </div>
                            <EventMap events={events} loading={isLoading} />
                        </>
                    )}
                </QueryBoundary>
            </Card>
        </AppShell>
    );
}
