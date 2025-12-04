import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../components/layout";
import { Card, FilterBar, DataTable } from "../components/ui";
import { QueryBoundary } from "../components/feedback";
import { apiFetch } from "../lib/apiClient";
import { formatDateTime } from "../lib/date";
import useAuthStore from "../store/authStore";

const PAGE_SIZE = 10;

export default function OrganizerEventsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [name, setName] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [orderBy, setOrderBy] = useState("startTime");
    const isOrganizer = useAuthStore((s) => {
        const role = s.user?.role;
        return !!s.user?.organizer || role === "manager" || role === "superuser";
    });

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["organizer-events", { page, name, locationFilter, orderBy }],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(PAGE_SIZE));
            if (name.trim()) params.set("name", name.trim());
            if (locationFilter.trim()) params.set("location", locationFilter.trim());
            params.set("orderBy", orderBy);
            return apiFetch(`/organizer/events?${params.toString()}`);
        },
    });

    function handleFilterSubmit(e) {
        e.preventDefault();
        setPage(1);
    }

    function handleOrderByChange(field) {
        setOrderBy(field);
        setPage(1);
        queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    }

    const columns = [
        { header: "Name", render: (row) => row.name },
        { header: "Location", render: (row) => row.location },
        { header: "Start", render: (row) => formatDateTime(row.startTime) },
        { header: "End", render: (row) => formatDateTime(row.endTime) },
        {
            header: "Capacity",
            render: (row) =>
                row.capacity == null
                    ? `${row.numGuests} guests`
                    : `${row.numGuests}/${row.capacity}`,
        },
        {
            header: "Actions",
            render: (row) => (
                <Link
                    className="btn btn-ghost btn-xs"
                    to={`/organizer/events/${row.id}`}
                >
                    Manage
                </Link>
            ),
        },
    ];

    if (!isOrganizer) {
        return (
            <AppShell title="Organizer events">
                <Card>You are not assigned as an organizer.</Card>
            </AppShell>
        );
    }

    return (
        <AppShell title="Organizer events" subtitle="Events you are responsible for.">
            <Card>
                <FilterBar onSubmit={handleFilterSubmit}>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-neutral/70 pl-1">Search</label>
                        <input
                            className="input input-bordered input-sm rounded-2xl border border-brand-200 bg-white px-3 py-2 text-sm text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-neutral/70 pl-1">Location</label>
                        <input
                            className="input input-bordered input-sm rounded-2xl border border-brand-200 bg-white px-3 py-2 text-sm text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                            placeholder="Location"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-neutral/70 pl-1">Sort by</label>
                        <select
                            className="select select-bordered select-sm rounded-2xl border border-brand-200 bg-white px-3 py-2 text-sm text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                            value={orderBy}
                            onChange={(e) => handleOrderByChange(e.target.value)}
                        >
                            <option value="name">Name</option>
                            <option value="startTime">Start Time</option>
                            <option value="endTime">End Time</option>
                        </select>
                    </div>
                    <button className="btn btn-primary btn-sm" type="submit">
                        Apply
                    </button>
                </FilterBar>
            </Card>
            <Card title="Events">
                <QueryBoundary query={{ data, isLoading, isError, error }} loadingLabel="Loading events…">
                    <DataTable columns={columns} data={data?.results ?? []} />
                </QueryBoundary>
                {data && data.count > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-neutral/70">
                            Page {page} of {Math.ceil(data.count / PAGE_SIZE) || 1}
                        </span>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setPage((p) => (p < Math.ceil(data.count / PAGE_SIZE) ? p + 1 : p))}
                            disabled={!data.count || page >= Math.ceil(data.count / PAGE_SIZE)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </Card>
        </AppShell>
    );
}
