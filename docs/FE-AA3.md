# Signature Hero: A Fullscreen Shader

Live route: https://leaddesk-capstone.vercel.app/playground/shader

Source: `src/components/webgl-experiment.tsx` (`heroVertex` and `heroFragment`).

## Shader walkthrough

- The vertex shader maps two triangles to clip space, covering the canvas.
- Medium floating-point precision keeps the simple fragment shader economical.
- `u_resolution` normalizes fragment pixel coordinates into 0–1 UV coordinates.
- `u_time` moves two sine fields slowly in opposite directions.
- `u_mouse` shifts the wave phases as the pointer moves over the canvas.
- The first sine field bends the second field into soft flowing bands.
- Mixing two dark greens produces the personalized LeadDesk palette. A powered wave adds a restrained highlight.
- The final RGBA output is opaque; white HTML text remains selectable above the decorative canvas.

## Performance and motion fallback

Device pixel ratio is capped at 1.5; hidden tabs cancel animation frames; reduced-motion users and devices without WebGL receive a static green gradient.

The renderer resizes with ResizeObserver, handles context loss, and releases its GPU resources and listeners on unmount.

## Personalization

Surya Teja’s name, LeadDesk’s conversation headline, dark green palette, slow intersecting bands and mouse phase influence make this the project’s own visual signature.

## Mentor practice

To make motion slower, decrease the time multipliers. To widen bands, reduce the UV frequency multipliers. To change the palette, change the two RGB vectors in `mix`. To remove interaction, remove mouse phase terms while retaining resolution and time.
