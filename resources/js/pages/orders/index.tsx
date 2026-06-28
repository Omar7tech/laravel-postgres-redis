import { Head, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import OrderController from '@/actions/App/Http/Controllers/OrderController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';

type Order = {
    id: number;
    reference: string;
    customer_name: string;
    customer_email: string;
    status: string;
    payment_method: string;
    items_count: number;
    subtotal_cents: number;
    discount_cents: number;
    tax_cents: number;
    shipping_cents: number;
    total_cents: number;
    currency: string;
    shipping_country: string;
    placed_at: string | null;
};

type CursorPaginated<T> = {
    data: T[];
    links: {
        prev: string | null;
        next: string | null;
    };
    meta: {
        per_page: number;
        next_cursor: string | null;
        prev_cursor: string | null;
    };
};

type Filters = {
    search: string | null;
    status: string | null;
    sort: string;
    direction: 'asc' | 'desc';
    per_page: number;
};

type OrdersIndexProps = {
    orders: CursorPaginated<Order>;
    filters: Filters;
    statuses: string[];
};

const STATUS_VARIANTS: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    pending: 'outline',
    paid: 'default',
    shipped: 'secondary',
    delivered: 'default',
    cancelled: 'destructive',
    refunded: 'destructive',
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const SORTABLE_COLUMNS: { key: string; label: string; className?: string }[] = [
    { key: 'reference', label: 'Reference' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'status', label: 'Status' },
    { key: 'total_cents', label: 'Total', className: 'text-right' },
    { key: 'placed_at', label: 'Placed' },
];

function formatMoney(cents: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function OrdersIndex({
    orders,
    filters,
    statuses,
}: OrdersIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const navigate = useCallback(
        (overrides: Partial<Filters>) => {
            // Any filter change drops the cursor so results restart from the top.
            const query = {
                search: filters.search ?? undefined,
                status: filters.status ?? undefined,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                ...overrides,
            };

            // Drop empty values so the URL stays clean.
            Object.keys(query).forEach((key) => {
                const value = query[key as keyof typeof query];

                if (value === undefined || value === null || value === '') {
                    delete query[key as keyof typeof query];
                }
            });

            router.get(OrderController.index.url(), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [filters],
    );

    // Debounce the free-text search.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            if ((filters.search ?? '') !== search) {
                navigate({ search: search || undefined });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search, navigate]);

    function toggleSort(column: string) {
        const direction =
            filters.sort === column && filters.direction === 'asc'
                ? 'desc'
                : 'asc';
        navigate({ sort: column, direction });
    }

    function resetFilters() {
        setSearch('');
        router.get(
            OrderController.index.url(),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const { links } = orders;
    const hasActiveFilters = Boolean(filters.search || filters.status);

    return (
        <>
            <Head title="Orders" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Orders
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Search and browse orders
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search reference, name, email…"
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(value) =>
                            navigate({
                                status: value === 'all' ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem
                                    key={status}
                                    value={status}
                                    className="capitalize"
                                >
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(filters.per_page)}
                        onValueChange={(value) =>
                            navigate({ per_page: Number(value) })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PER_PAGE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={resetFilters}>
                            <X className="size-4" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    {SORTABLE_COLUMNS.map((column) => {
                                        const isActive =
                                            filters.sort === column.key;
                                        const SortIcon = !isActive
                                            ? ArrowUpDown
                                            : filters.direction === 'asc'
                                              ? ArrowUp
                                              : ArrowDown;

                                        return (
                                            <th
                                                key={column.key}
                                                className={`px-4 py-3 font-medium ${column.className ?? ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleSort(column.key)
                                                    }
                                                    className={`inline-flex items-center gap-1.5 hover:text-foreground ${
                                                        column.className ===
                                                        'text-right'
                                                            ? 'flex-row-reverse'
                                                            : ''
                                                    } ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                                                >
                                                    {column.label}
                                                    <SortIcon className="size-3.5" />
                                                </button>
                                            </th>
                                        );
                                    })}
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        Items
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center text-muted-foreground"
                                        >
                                            No orders match your filters.
                                        </td>
                                    </tr>
                                )}

                                {orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {order.reference}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {order.customer_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {order.customer_email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    STATUS_VARIANTS[
                                                        order.status
                                                    ] ?? 'secondary'
                                                }
                                                className="capitalize"
                                            >
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                                            {formatMoney(
                                                order.total_cents,
                                                order.currency,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                            {formatDate(order.placed_at)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                                            {order.items_count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cursor pagination — prev/next only, no total count for speed. */}
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!links.prev}
                        onClick={() =>
                            links.prev &&
                            router.visit(links.prev, {
                                preserveState: true,
                                preserveScroll: true,
                            })
                        }
                    >
                        <ChevronLeft className="size-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!links.next}
                        onClick={() =>
                            links.next &&
                            router.visit(links.next, {
                                preserveState: true,
                                preserveScroll: true,
                            })
                        }
                    >
                        Next
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Orders',
            href: OrderController.index(),
        },
    ],
};
