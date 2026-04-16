// OPEN ACCESS MODE — pricing page temporarily redirected to home
// To restore: copy page.tsx.bak back to page.tsx
import { redirect } from 'next/navigation';
export default function PricingPage() {
  redirect('/');
}
