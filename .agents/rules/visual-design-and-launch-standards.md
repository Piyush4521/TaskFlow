---
trigger: always_on
---

## Visual Design and Launch Standards

### 1. Design principles
Build a professional, intentional, recruiter-ready interface. The product must look like a real software application, not a generic AI-generated website. Prioritize clarity, consistency, usability, accessibility, and responsive behavior.

### 2. Strictly prohibited design patterns
- No purple gradients.
- No pill-shaped buttons. Use appropriately sized rectangular buttons with modest corner radii.
- No fake reviews, testimonials, customer logos, customer counters, or fabricated metrics.
- No vague hero headlines or generic AI-generated marketing copy.
- No emoji icons in the interface. Use a consistent, professional icon library where icons are necessary.
- No em dashes in website copy.
- No excessive scroll animations, cursor animations, or decorative motion effects.
- No AI-generated stock-style photos or generic AI-slop imagery.
- No fabricated product claims or unsupported statements.
- No "Made with AI" or similar unwanted builder attribution in the final product.

### 3. TaskFlow visual direction
- Design a practical Kanban application, not a marketing landing page disguised as a product.
- Use a restrained, coherent color palette with strong contrast and clear status colors.
- Use typography with a deliberate hierarchy and consistent spacing.
- Use modest corner radii, clear borders, and subtle shadows only where useful.
- Keep task cards readable and actions discoverable.
- Make To-Do, In-Progress, and Done visually distinguishable.
- Ensure layouts work on desktop, tablet, and mobile.
- Provide visible focus states and accessible labels.
- Respect reduced-motion preferences.
- Use real product functionality and genuine application states as the primary source of visual quality.
- Never fabricate data to make the interface look populated. Use clearly identified demo data only if explicitly needed for a demo.

### 4. Content and asset integrity
- Use concise, specific copy that accurately describes TaskFlow functionality.
- Use genuine, relevant assets only when required. Prefer CSS, typography, and product UI over decorative photography.
- Do not invent testimonials, company endorsements, usage statistics, security certifications, or customer success stories.
- Do not hide errors or unfinished features behind visual placeholders.
- Use a real favicon and consistent application branding.

### 5. Mandatory pre-launch checklist
Do not declare the application launch-ready until every applicable item below has been verified.

- [ ] Custom domain connected and DNS verified.
- [ ] HTTPS working on the custom domain.
- [ ] Favicon installed and verified in the browser.
- [ ] Unwanted "Made with AI" or builder attribution removed, where applicable and permitted.
- [ ] Privacy Policy page published.
- [ ] Terms and Conditions page published.
- [ ] Legal pages accurately describe the actual product, data collection, authentication, storage, and applicable practices.
- [ ] No fake reviews, metrics, testimonials, or unsupported claims.
- [ ] Registration, login, logout, and protected routes tested.
- [ ] Task CRUD and status transitions tested.
- [ ] Per-user task authorization verified.
- [ ] Loading, empty, validation, and error states tested.
- [ ] Responsive layouts and accessibility basics checked.
- [ ] Production builds pass.
- [ ] Environment variables and secrets handled securely.
- [ ] Public GitHub repository and README reviewed.

### 6. Release discipline
Treat each checklist item as a verification requirement, not an assumption. Mark an item complete only when there is evidence. If a domain, deployment credential, configuration, or external service is unavailable, identify the blocker explicitly. Never claim that a site is launched or compliant merely because its code has been written.

Complete mandatory assessment functionality and security before optional visual effects or bonus features. Preserve working code and validate meaningful changes incrementally.