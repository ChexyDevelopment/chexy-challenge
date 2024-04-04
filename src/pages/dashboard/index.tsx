import { GetServerSidePropsContext } from 'next';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Trans } from 'next-i18next';

import { withAppProps } from '~/lib/props/with-app-props';
import RouteShell from '~/components/RouteShell';

const DashboardDemo = dynamic(
  () => import('~/components/dashboard/DashboardDemo'),
  {
    ssr: false,
  },
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsLoading(true);
      const timer2 = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer2);
    }, 500);

    return () => clearTimeout(timer1);
  }, []);
  return (
    <>
      {!isLoading && (
        <RouteShell
          title={<Trans i18nKey={'common:dashboardTabLabel'} />}
          description={<Trans i18nKey={'common:dashboardTabDescription'} />}
        >
          <DashboardDemo />
        </RouteShell>
      )}
    </>
  );
};

export default Dashboard;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
