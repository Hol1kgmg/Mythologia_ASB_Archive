'use client';

import ErrorPage from '../components/ErrorPage';
import PageFooter from '../components/PageFooter';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: AppErrorProps) {
  return (
    <>
      <ErrorPage 
        title="ERROR"
        message="予期しないエラーが発生しました"
        subMessage="申し訳ございませんが、一時的な問題が発生している可能性があります。"
        error={error}
        onRetry={reset}
        showRetryButton={true}
        showHomeButton={true}
        showErrorDetails={true}
      />
      <PageFooter />
    </>
  );
}