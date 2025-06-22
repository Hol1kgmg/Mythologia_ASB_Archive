interface PageFooterProps {
  className?: string;
}

export default function PageFooter({
  className = 'text-sm text-slate-400 mt-12',
}: PageFooterProps) {
  return (
    <div className="text-center py-4">
      <footer className={className}>
        <p>Mythologia Admiral Ship Bridge</p>
        <p className="mt-1">神託のメソロギア 非公式ファンサイト</p>
      </footer>
    </div>
  );
}
