interface FeedVersionBadgeProps {
  version: string;
}

export function FeedVersionBadge({ version }: FeedVersionBadgeProps) {
  if (!version) return null;
  return (
    <span className="inline-flex items-center rounded-sm bg-oa-grey-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-oa-grey-700">
      {version}
    </span>
  );
}
