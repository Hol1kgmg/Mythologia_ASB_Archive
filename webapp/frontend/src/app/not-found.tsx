import type { Metadata } from 'next';
import NotFoundPage from '../components/page/NotFoundPage';
import PageFooter from '../components/ui/layout/PageFooter';

export const metadata: Metadata = {
  title: '404 - ページが見つかりません | Mythologia ASB',
  description:
    'お探しのページは見つかりませんでした。ホームページまたは主要ページからご利用ください。',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <>
      <NotFoundPage
        title="404"
        message="お探しのページが見つかりませんでした"
        showHomeLink={true}
      />
      <PageFooter />
    </>
  );
}
