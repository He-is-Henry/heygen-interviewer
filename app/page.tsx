import { headers } from 'next/headers';
import { userAgent } from 'next/server';
import InterviewerPage from './components/InterviewerPage';

export default async function Page() {
  const { device } = userAgent({ headers: await headers() });
  const isMobile = device?.type === 'mobile';

  return <InterviewerPage isMobile={isMobile} />;
}