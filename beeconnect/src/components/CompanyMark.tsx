import { Flex } from '@chakra-ui/react'

interface CompanyMarkProps {
  name?: string
}

const CompanyMark = ({ name = '' }: CompanyMarkProps) => (
  <Flex
    align="center"
    aria-label={name ? `${name} logo` : 'Company logo'}
    bg="yellow.100"
    color="yellow.800"
    fontSize="xs"
    fontWeight="bold"
    justify="center"
    rounded="md"
    role="img"
    flexShrink={0}
    boxSize={6}
  >
    {name.trim().charAt(0).toUpperCase() || '?'}
  </Flex>
)

export default CompanyMark
