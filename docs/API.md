# API Reference

Server Actions documentation for AgalApp.

## Overview

All mutations use **Server Actions** - TypeScript functions that run on the server and can be called directly from components.

### ActionResult Pattern

```typescript
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };
```

**Example usage:**
```typescript
const result = await createTruck({ name: "קפה טוב", city: "תל אביב" });

if (result.success) {
  console.log("Created:", result.data.id);
} else {
  console.error("Error:", result.message);
}
```

---

## Truck Actions

### createTruck

Creates a new coffee truck listing.

**Required Role:** `TRUCK_OWNER` or `ADMIN`

```typescript
await createTruck({
  name: string,      // min 2 chars
  city: string,      // must be in allowed cities
  address: string,   // min 5 chars
});
```

**Returns:** `ActionResult<CoffeeTruck>`

**Side effects:**
- Geocodes address if lat/lng missing
- Revalidates `/trucks`

---

### updateTruck

Updates an existing truck.

**Required Role:** Owner or `ADMIN`

```typescript
await updateTruck({
  id: string,
  name?: string,
  city?: string,
  address?: string,
});
```

**Returns:** `ActionResult<CoffeeTruck>`

---

### deleteTruck

Deletes a truck and all associated data.

**Required Role:** Owner or `ADMIN`

```typescript
await deleteTruck({ id: string });
```

**Returns:** `ActionResult<void>`

**Side effects:** Cascades delete images, reviews, votes, hours

---

## Review Actions

### createReview

Creates a review for a truck.

**Required Role:** `USER`, `TRUCK_OWNER`, or `ADMIN`

```typescript
await createReview({
  truckId: string,
  rating: number,    // 1-5
  content: string,   // min 10 chars
});
```

**Returns:** `ActionResult<Review>`

**Business rules:**
- One review per user per truck
- Cannot review own truck

---

### updateReview

Updates an existing review.

**Required Role:** Review author only

```typescript
await updateReview({
  id: string,
  rating?: number,
  content?: string,
});
```

---

### deleteReview

Deletes a review.

**Required Role:** Author or `ADMIN`

```typescript
await deleteReview({ id: string });
```

---

## Vote Actions

### toggleVote

Toggles a vote on a review (adds/removes).

**Required Role:** Any authenticated user

```typescript
await toggleVote({ reviewId: string });
```

**Returns:** `ActionResult<{ voted: boolean; voteCount: number }>`

---

## Image Actions

### uploadTruckImage

Uploads an image for a truck.

**Required Role:** Owner or `ADMIN`

```typescript
await uploadTruckImage({
  truckId: string,
  file: File,
  alt?: string,
  isPrimary?: boolean,
});
```

**Business rules:**
- Max 10 images per truck
- File types: JPEG, PNG, WebP
- Max size: 5MB

---

### deleteTruckImage

Deletes an image.

**Required Role:** Owner or `ADMIN`

```typescript
await deleteTruckImage({ imageId: string, truckId: string });
```

---

## Subscription Actions

### upgradeToPremium

Upgrades user to premium tier.

**Required Role:** `USER` or `TRUCK_OWNER`

```typescript
await upgradeToPremium({ duration: number });  // days
```

**Note:** Mock implementation - integrate with payment provider for production.

---

### cancelSubscription

Cancels premium subscription.

**Required Role:** `USER` or `TRUCK_OWNER`

```typescript
await cancelSubscription();
```

---

## Truck Hours Actions

### updateTruckHours

Updates operating hours.

**Required Role:** Owner or `ADMIN`
**Premium Feature:** Requires PREMIUM tier or ADMIN role

```typescript
await updateTruckHours({
  truckId: string,
  hours: Array<{
    dayOfWeek: number,    // 0-6 (Sunday-Saturday)
    openTime?: string,    // "HH:MM"
    closeTime?: string,   // "HH:MM"
    isClosed?: boolean,
  }>,
});
```

---

## Attribute Actions

### assignAttribute

Assigns an attribute to a truck.

**Required Role:** Owner or `ADMIN`

```typescript
await assignAttribute({
  truckId: string,
  attributeId: string,
});
```

---

### removeAttribute

Removes an attribute from a truck.

```typescript
await removeAttribute({
  truckId: string,
  attributeId: string,
});
```

---

## Error Handling

All actions return Hebrew error messages:

```typescript
// Authentication error
{ success: false, message: "אינך מחובר" }

// Authorization error
{ success: false, message: "אין לך הרשאה" }

// Validation error
{ success: false, message: "השם חייב להכיל לפחות 2 תווים" }

// Generic error
{ success: false, message: "שגיאה כללית" }
```

---

## Cache Revalidation

Actions use `revalidatePath()` to update cached data:

```typescript
revalidatePath("/trucks");
revalidatePath(`/trucks/${truckId}`);
```

---

[← Architecture](ARCHITECTURE.md) | [Testing Guide →](TESTING.md)
