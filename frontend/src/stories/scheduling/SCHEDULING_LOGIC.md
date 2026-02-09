# Scheduling Logic Explanation

### The Core Concept: "The Universal Clock"

Imagine three clocks:

1.  **The Host's Clock:** The doctor in Tokyo (User B).
2.  **Your Clock:** The person booking the meeting (User A).
3.  **The Sky Clock (UTC):** A universal master clock that never changes.

The system uses the **Sky Clock (UTC)** as the common language to translate between everyone's different timezones.

---

### Step-by-Step Logic (How it works)

Here is what happens when you select a date in the calendar:

#### 1. Establish the Host's Schedule (In Their Time)

- **Code:** `HOST_CONFIG` in `mockData.ts`
- **Logic:** The system looks at the Host's rules.
  - _Example:_ "Dr. Tanaka is in **Tokyo**. He works **9:00 AM to 5:00 PM**, Monday to Friday."

#### 2. Generate Potential Slots

- **Code:** `getAvailableSlots` function
- **Logic:** The system creates a list of 1-hour meeting slots for that specific day based on the **Host's Clock**.
  - _Slot 1:_ 9:00 AM - 10:00 AM (Tokyo Time)
  - _Slot 2:_ 10:00 AM - 11:00 AM (Tokyo Time)
  - ...and so on.

#### 3. Translate to "Sky Clock" (UTC)

- **Code:** `.utc()`
- **Logic:** This is the most important part. The system converts those Tokyo times into Universal Time.
  - _Slot 1 (9 AM Tokyo)_ becomes **12:00 AM UTC**.
  - _Slot 2 (10 AM Tokyo)_ becomes **1:00 AM UTC**.

#### 4. Check for Conflicts (The "Busy" List)

- **Code:** `MOCK_MEETINGS` and `isBusy` check
- **Logic:** The database stores all existing meetings in **Sky Clock (UTC)** time.
  - The system compares the new potential slots (in UTC) with the existing meetings (in UTC).
  - If they overlap, that slot is thrown away.

#### 5. Show Results to You (In Your Time)

- **Code:** `SchedulingTest.tsx` (specifically `localStart.format(...)`)
- **Logic:** The system takes the remaining "Free" slots (which are still in UTC) and translates them to **Your Clock**.
  - If you are in New York, that **12:00 AM UTC** slot shows up as **7:00 PM** (on the previous day).

---

### Summary for your Colleague

> "We don't store times as '9 AM' or '5 PM' because 9 AM means something different in every country.
>
> Instead, we convert the Host's working hours into **Universal Time (UTC)**. We check for conflicts in Universal Time. Finally, when we show the available slots to the user, we convert that Universal Time back into the user's local time.
>
> This ensures that when a user in New York books a slot, they are booking the exact moment the doctor in Tokyo is free, regardless of what their clocks say."
