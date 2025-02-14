import { VStack, HStack, SpanBox } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import Link from 'next/link'
import { Button } from '../elements/Button'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'

type ErrorPageStatusCode = 404 | 500

type ErrorLayoutProps = {
  message?: string
  statusCode: ErrorPageStatusCode
}

export function ErrorLayout(props: ErrorLayoutProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  console.log(viewerData?.me)

  return (
    <VStack alignment="center" distribution="start" css={{ height: '100%' }}>
      <HStack alignment="center" css={{ mt: '64px', verticalAlign: 'middle' }}>
        <StyledText
          style="headline"
          css={{
            marginRight: '25px',
            padding: '32px',
            borderRight: '1px solid $grayText',
          }}
        >
          {props.statusCode}
        </StyledText>
        <StyledText style="body">
          {props.message ? props.message : 'An error occurred.'}
        </StyledText>
      </HStack>
      <SpanBox css={{ height: '64px' }} />
      <Link passHref href={viewerData?.me ? '/home' : '/login'}>
        <Button style="ctaDarkYellow">
          {viewerData?.me ? 'Go Home' : 'Login'}
        </Button>
      </Link>
    </VStack>
  )
}
