import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface AuthVerificationEmailProps {
  confirmationLink: string;
  username?: string;
}

export default function AuthVerificationEmail({
  confirmationLink = 'https://mekan.guru/auth/confirm?token=...',
  username = 'Gezgin',
}: AuthVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>mekan.guru&apos;ya hoş geldiniz! Email adresinizi doğrulayın.</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://www.mekan.guru/web-app-manifest-192x192.png"
                width="40"
                height="40"
                alt="mekan.guru"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Email Adresinizi Doğrulayın
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Merhaba <strong>{username}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              mekan.guru&apos;ya katıldığınız için teşekkürler! Hesabınızı aktifleştirmek ve topluluğun bir parçası olmak için lütfen aşağıdaki butona tıklayın.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#f97316] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmationLink}
              >
                Hesabımı Doğrula
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              veya aşağıdaki linki tarayıcınıza kopyalayın:
            </Text>
            <Link
              href={confirmationLink}
              className="text-[#f97316] no-underline"
            >
              {confirmationLink}
            </Link>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Bu e-postayı mekan.guru&apos;ya kayıt olduğunuz için aldınız. Eğer siz kayıt olmadıysanız, bu mesajı görmezden gelebilirsiniz.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
