# Skipped Changes Log

### S1: Optional Touch Drag-to-Reassemble Gesture on Mobile
- **Description**: Reverse drag-to-reassemble gesture on mobile phones to pull torn halves back together.
- **Reason for Skipping**: Per prompt specification: *"Optional: on phones, the user may also drag the torn halves back together. Support this only if it can be done without blocking vertical page scrolling. If not, skip it and log it in qa/skipped.md."*
  On mobile devices, once the card is torn, the primary interaction area spans the revealed answer text. Capturing pointer events for a multi-directional pinch or reverse drag across the text collides with vertical viewport scrolling and page touch targets. Instead, the prominent WCAG AA & Apple HIG compliant 44px min-height button (`"Put the page back together"`) provides a 100% reliable, zero-conflict reverse spring interaction without any risk of hijacking mobile vertical scrolling.

