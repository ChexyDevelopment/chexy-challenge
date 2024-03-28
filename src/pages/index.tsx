import Image from 'next/image';
import { GetStaticPropsContext } from 'next';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

import Container from '~/core/ui/Container';
import SubHeading from '~/core/ui/SubHeading';
import Button from '~/core/ui/Button';
import Layout from '~/core/ui/Layout';
import SiteHeader from '~/components/SiteHeader';
import { withTranslationProps } from '~/lib/props/with-translation-props';

function Index() {
  return (
    <Layout>
      <SiteHeader />

      <Container>
        <div
          className={
            'my-12 flex flex-col items-center md:flex-row lg:my-16' +
            ' mx-auto flex-1 justify-center animate-in fade-in ' +
            ' duration-1000 slide-in-from-top-12'
          }
        >
          <div className={'flex w-full flex-1 flex-col items-center space-y-8'}>
            <Pill>
              <span>Dare to Solve the Unsolvables?</span>
            </Pill>

            <HeroTitle>
              <span>Think You Can Handle</span>
              <span
                className={
                  'bg-gradient-to-br bg-clip-text text-transparent' +
                  ' from-primary-400 to-primary-700 leading-[1.2]'
                }
              >
                The Ultimate Debugging Challenge?
              </span>
            </HeroTitle>

            <SubHeading className={'text-center'}>
              <span>
                The purpose of this challenge to see how you think, and your
              </span>
              <span>
                level of communication through out the challenge. Make sure you
              </span>
              <span>
                think out loud and walk us through how you are debugging.
              </span>
            </SubHeading>
            <div className={'flex flex-col items-center space-y-4'}>
              <MainCallToActionButton />
            </div>
          </div>
        </div>

        <div
          className={
            'flex justify-center py-12 max-w-5xl mx-auto animate-in fade-in ' +
            ' duration-1000 slide-in-from-top-16 fill-mode-both delay-300'
          }
        >
          <Image
            priority
            className={
              'shadow-[0_0_1000px_0] rounded-2xl' +
              ' shadow-primary/40 animate-in fade-in' +
              ' zoom-in-50 delay-300 duration-1000 ease-out fill-mode-both'
            }
            width={2688}
            height={1824}
            src={`/assets/images/dashboard.png`}
            alt={`App Image`}
          />
        </div>
      </Container>
    </Layout>
  );
}

export default Index;

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const { props } = await withTranslationProps({ locale });

  return {
    props,
  };
}

function HeroTitle({ children }: React.PropsWithChildren) {
  return (
    <h1
      className={
        'text-center text-4xl text-gray-600 dark:text-white md:text-5xl' +
        ' flex flex-col font-heading font-medium xl:text-7xl 2xl:text-[5.2rem]'
      }
    >
      {children}
    </h1>
  );
}

function Pill(props: React.PropsWithChildren) {
  return (
    <h2
      className={
        'inline-flex w-auto items-center space-x-2' +
        ' rounded-full bg-gradient-to-br dark:from-gray-200 dark:via-gray-400' +
        ' dark:to-gray-700 bg-clip-text px-4 py-2 text-center text-sm' +
        ' font-normal text-gray-500 dark:text-transparent shadow' +
        ' dark:shadow-dark-700'
      }
    >
      <span>{props.children}</span>
    </h2>
  );
}

function MainCallToActionButton() {
  return (
    <Button
      className={
        'bg-transparent bg-gradient-to-r shadow-2xl' +
        ' hover:shadow-primary/60 from-primary' +
        ' to-primary-600 hover:to-indigo-600 text-white'
      }
      variant={'custom'}
      size={'lg'}
      round
      href={'/auth/sign-in'}
    >
      <span className={'flex items-center space-x-2'}>
        <span>Get Started</span>
        <ChevronRightIcon
          className={
            'h-4 animate-in fade-in slide-in-from-left-8' +
            ' delay-1000 fill-mode-both duration-1000 zoom-in'
          }
        />
      </span>
    </Button>
  );
}
