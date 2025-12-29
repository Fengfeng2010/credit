import { RedEnvelopeClaimPage } from "@/components/common/redenvelope/red-envelope-claim"

interface Props {
  params: Promise<{ code: string }>
}

export default async function RedEnvelopePage({ params }: Props) {
  const { code } = await params
  return <RedEnvelopeClaimPage code={code} />
}