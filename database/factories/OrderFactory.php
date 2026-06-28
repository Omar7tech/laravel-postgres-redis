<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(500, 500000);
        $discount = fake()->boolean(30) ? (int) round($subtotal * fake()->randomFloat(2, 0.05, 0.3)) : 0;
        $tax = (int) round(($subtotal - $discount) * 0.1);
        $shipping = fake()->randomElement([0, 0, 500, 1000, 1500]);

        return [
            'user_id' => 2,
            'reference' => 'ORD-'.strtoupper(Str::random(10)),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'status' => fake()->randomElement(Order::STATUSES),
            'payment_method' => fake()->randomElement(Order::PAYMENT_METHODS),
            'items_count' => fake()->numberBetween(1, 12),
            'subtotal_cents' => $subtotal,
            'discount_cents' => $discount,
            'tax_cents' => $tax,
            'shipping_cents' => $shipping,
            'total_cents' => $subtotal - $discount + $tax + $shipping,
            'currency' => fake()->randomElement(['USD', 'EUR', 'GBP']),
            'shipping_country' => fake()->countryCode(),
            'placed_at' => fake()->dateTimeBetween('-2 years', 'now'),
        ];
    }

    /**
     * Indicate that the order has been paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
        ]);
    }
}
