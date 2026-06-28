<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $reference
 * @property string $customer_name
 * @property string $customer_email
 * @property string $status
 * @property string $payment_method
 * @property int $items_count
 * @property int $subtotal_cents
 * @property int $discount_cents
 * @property int $tax_cents
 * @property int $shipping_cents
 * @property int $total_cents
 * @property string $currency
 * @property string $shipping_country
 * @property Carbon $placed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'reference',
    'customer_name',
    'customer_email',
    'status',
    'payment_method',
    'items_count',
    'subtotal_cents',
    'discount_cents',
    'tax_cents',
    'shipping_cents',
    'total_cents',
    'currency',
    'shipping_country',
    'placed_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * The available order statuses.
     *
     * @var list<string>
     */
    public const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];

    /**
     * The available payment methods.
     *
     * @var list<string>
     */
    public const PAYMENT_METHODS = ['card', 'paypal', 'bank_transfer', 'cash_on_delivery'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'items_count' => 'integer',
            'subtotal_cents' => 'integer',
            'discount_cents' => 'integer',
            'tax_cents' => 'integer',
            'shipping_cents' => 'integer',
            'total_cents' => 'integer',
            'placed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
