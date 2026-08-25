import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  nome?: string
  link?: string
}

const Email = ({ nome, link }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu Guia do Primeiro Passaporte está pronto para download</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={bar} />
        <Heading style={h1}>Pagamento confirmado</Heading>
        <Text style={text}>
          {nome ? `Olá, ${nome}!` : 'Olá!'} Recebemos a confirmação do seu pagamento
          e o seu Guia do Primeiro Passaporte já está disponível.
        </Text>
        {link ? (
          <Section style={{ margin: '28px 0' }}>
            <Button href={link} style={button}>
              Baixar o guia em PDF
            </Button>
          </Section>
        ) : null}
        <Text style={muted}>
          Este link de download é pessoal e fica ativo por 72 horas. Recomendamos
          salvar o arquivo no seu dispositivo assim que baixar.
        </Text>
        <Hr style={hr} />
        <Text style={muted}>
          Em caso de dúvidas, basta responder a este e-mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Seu Guia do Primeiro Passaporte (PDF)',
  displayName: 'Entrega do guia em PDF',
  previewData: {
    nome: 'Maria Silva',
    link: 'https://example.com/guia-primeiro-passaporte.pdf',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Raleway, Arial, sans-serif',
  color: '#1c1c1c',
}
const container = {
  padding: '24px 28px',
  maxWidth: '600px',
  border: '1px solid #e6e9ec',
  borderRadius: '8px',
}
const bar = {
  backgroundColor: '#1351B4',
  height: '6px',
  borderRadius: '3px',
  marginBottom: '20px',
}
const h1 = { fontSize: '22px', color: '#1351B4', margin: '0 0 12px' }
const text = { fontSize: '15px', lineHeight: '24px' }
const muted = { fontSize: '13px', lineHeight: '20px', color: '#555' }
const button = {
  backgroundColor: '#1351B4',
  color: '#ffffff',
  padding: '12px 22px',
  borderRadius: '24px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
}
const hr = { borderColor: '#e6e9ec', margin: '24px 0 16px' }
