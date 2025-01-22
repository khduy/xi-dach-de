# Xì Dách Rules and AI Task List

## Basic Information

*   **Game Type:** Multiplayer card game (2-8 players)
*   **Roles:**
    *   "Nhà Cái" (Dealer) - One player, the creator of the room
    *   "Nhà Con" (Players) - All other players
*   **Objective:** Achieve a hand sum as close to 21 as possible without exceeding it. Players compete against the Dealer.
*   **Card Set:** Standard 52-card deck

## Card Values

*   **Number Cards (2-10):** Face value
*   **Face Cards (J, Q, K):** 10 points
*   **Ace (A):** 1, 10, or 11 points (player's choice for the most advantageous value)

## Gameplay Phases

1. **Room Creation and Dealing:**
    *   Players can create game rooms. The room creator becomes the "Nhà Cái".
    *   The "Nhà Cái" (Dealer) does **not** deal to themselves first.
    *   The "Nhà Cái" must start dealing with one of the two players next to them.
    *   Each player ("Nhà Cái" and "Nhà Con") receives two cards.
    *   **Players can only see their own cards.**
2. **Initial Hand Evaluation (Phase 1: Check for Special Hands):**
    *   All players (including "Nhà Cái") look at their initial two-card hand.
    *   **Special Hands:**
        *   **Xì Bàng:** Two Aces (AA).
        *   **Xì Dách:** One Ace (A) and one Ten-value card (10, J, Q, or K).
    *   **Immediate Win Condition:**
        *   If the "Nhà Cái" has "Xì Bàng" or "Xì Dách", they immediately win against all "Nhà Con" except those who also have "Xì Dách" or "Xì Bàng".
        *   If a "Nhà Con" has "Xì Bàng" or "Xì Dách", they immediately win against the "Nhà Cái" if the dealer does not have a special hand. If both "Nhà Cái" and "Nhà Con" have special hands, it's a tie or push between them.
3. **Player Turns (Drawing Phase) (Phase 2):**
    *   The order of turns is determined by the order in which the "Nhà Cái" dealt the cards.
        *   If the "Nhà Cái" dealt to the player on their left first, turns proceed **counterclockwise**.
        *   If the "Nhà Cái" dealt to the player on their right first, turns proceed **clockwise**.
    *   Starting with the first player dealt to, each "Nhà Con" decides whether to draw additional cards or stand.
        *   **Goal:** Try to achieve a hand value between 16 and 21 (inclusive).
        *   **Non:** Hand value less than 16. **"Nhà Con" must draw if their hand is "Non".**
        *   **Đủ:** Hand value between 16 and 21.
        *   **Quá (Quắc):** Hand value greater than 21. Players who go "Quắc" cannot draw further.
        *   **Maximum Hand Size:** 5 cards. Players cannot draw if they already have 5 cards.
    *   The "Nhà Cái" is the last to decide whether to draw or stand.
        *   **Goal:** Try to achieve a hand value between 16 and 21 (inclusive).
        *   **Non:** Hand value less than 15. **"Nhà Cái" must draw if their hand is "Non".**
        *   **Đủ:** Hand value between 16 and 21.
        *   **Quá (Quắc):** Hand value greater than 21. The "Nhà Cái" cannot draw further if they go "Quắc".
        *   **Maximum Hand Size:** 5 cards. The "Nhà Cái" cannot draw if they already have 5 cards.
4. **Determining the Winner (Phase 2 - if no special hands in Phase 1):**
    *   **Dealer's Right to Compare Hands:** After all "Nhà Con" have finished drawing, the "Nhà Cái" can compare their hand with any "Nhà Con's" hand **only if the "Nhà Cái" is no longer "Non" (their hand value is 16 or more).**
        *   If the "Nhà Cái" has a higher hand value than the "Nhà Con", the "Nhà Cái" wins.
        *   If the "Nhà Cái" has a lower hand value than the "Nhà Con", the "Nhà Cái" loses.
        *   If the hand values are equal, it's a tie (push).
        *   **The "Nhà Cái" can continue to draw cards even after comparing hands.**
        *   **When the "Nhà Cái" compares hands with a "Nhà Con", that "Nhà Con's" hand becomes public to all players in the room.**
        *   **When the "Nhà Cái" makes their first comparison, the "Nhà Cái's" hand also becomes public to all players.**
    *   **Special Hand - Ngũ Linh:**
        *   A player automatically wins if they have five cards with a total value less than 21, regardless of the dealer's hand.
        *   If both "Nhà Cái" and "Nhà Con" have "Ngũ Linh", it's a tie between them.
    *   **Case: Quắc (Bust):**
        *   If both "Nhà Con" and "Nhà Cái" are "Quắc", it's a tie/push between them.
        *   If only one side is "Quắc", the other side wins.
    *   **Case: Not Quắc:**
        *   The side with the higher hand value wins.
        *   If "Nhà Con" and "Nhà Cái" have the same hand value, it's a tie/push.

## AI Task List

1. **Initialize Game:**
    *   Create a standard 52-card deck.
    *   Set the number of players (2-8).
    *   **Implement room creation functionality, where the creator is designated as the "Nhà Cái".**
    *   Assign "Nhà Cái" and "Nhà Con" roles.
2. **Deal Cards:**
    *   Implement dealing logic that adheres to the rule that the "Nhà Cái" does not deal to themselves first.
    *   Deal two cards to each player, including the "Nhà Cái".
    *   Keep track of the dealing order to determine the turn order.
    *   **Ensure players can only see their own cards.**
3. **Calculate Hand Value:**
    *   Implement a function to calculate the value of a hand, considering the flexible value of the Ace.
4. **Check for Special Hands (Xì Bàng, Xì Dách):**
    *   After dealing, check if any player (both "Nhà Con" and "Nhà Cái") has "Xì Bàng" or "Xì Dách".
    *   Implement the immediate win condition for both "Nhà Con" and "Nhà Cái" based on special hands.
5. **Implement Player Turn Logic (Phase 2):**
    *   Allow each "Nhà Con" to choose to draw a card or stand, following the established turn order.
    *   **Enforce the rule that "Nhà Con" must draw if their hand is "Non".**
    *   Implement logic for "Non", "Đủ", and "Quá (Quắc)" conditions for "Nhà Con".
    *   **Enforce the maximum hand size of 5 cards for "Nhà Con".**
    *   Implement the "Nhà Cái"'s turn after all "Nhà Con" have completed their turns.
    *   **Enforce the rule that "Nhà Cái" must draw if their hand is "Non".**
    *   Implement logic for "Non", "Đủ", and "Quá (Quắc)" conditions for "Nhà Cái".
    *   **Enforce the maximum hand size of 5 cards for "Nhà Cái".**
6. **Determine the Winner (Phase 2):**
    *   Implement logic for determining the winner based on "Quắc" and hand value comparisons.
    *   **Check for "Ngũ Linh" and implement the automatic win condition and tie condition.**
    *   **Implement the "Nhà Cái"'s ability to compare hands with "Nhà Con" after all players have finished drawing, only if the "Nhà Cái" is no longer "Non".**
    *   **Allow the "Nhà Cái" to continue drawing cards after comparing hands.**
    *   **Make the "Nhà Con's" hand public to all players when the "Nhà Cái" chooses to compare hands.**
    *   **Make the "Nhà Cái's" hand public to all players when they make their first comparison.**

