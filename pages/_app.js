import Head from "next/head";
import App from 'next/app';
import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import '../styles/globals.less';


class MyApp extends App  {
   static async getInitialProps({ Component, ctx }) {
    const {
      isServer,
      pathname,
    } = ctx;

    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) || {} : {};
    console.log('pageProps: ', pageProps);

    return {
      isServer,
      // token: validToken,
      pathname,
      pageProps: {
        ...pageProps,
      },
    };
  }
  
  render() {
    const {
      Component,
      pageProps,
      // store,
    } = this.props;
    return (
    <div>
      <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="icon" href="/favicon.ico" />
          <title>{pageProps.pageTitle || 'NEXT_LEARN'}</title>
      </Head>
      <ConfigProvider locale={zh_CN}>
        <Component {...pageProps} />
      </ConfigProvider>
  </div>
  )
  }

}

export default MyApp
