import { ReactNode, useMemo } from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { Circle } from 'phosphor-react'
import { useGetSubscriptionsQuery } from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { theme } from '../../tokens/stitches.config'
import { useRegisterActions } from 'kbar'
import { LogoBox } from '../../elements/LogoBox'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { ToggleCaretDownIcon } from '../../elements/icons/ToggleCaretDownIcon'
import Link from 'next/link'
import { ToggleCaretRightIcon } from '../../elements/icons/ToggleCaretRightIcon'

export const LIBRARY_LEFT_MENU_WIDTH = '233px'

type LibraryFilterMenuProps = {
  setShowAddLinkModal: (show: boolean) => void

  searchTerm: string | undefined
  applySearchQuery: (searchTerm: string) => void

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void
}

export function LibraryFilterMenu(props: LibraryFilterMenuProps): JSX.Element {
  return (
    <>
      <Box
        css={{
          left: '0px',
          top: '0px',
          position: 'fixed',
          bg: '$thLeftMenuBackground',
          height: '100%',
          width: LIBRARY_LEFT_MENU_WIDTH,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            visibility: props.showFilterMenu ? 'visible' : 'hidden',
            width: '100%',
            transition: 'visibility 0s, top 150ms',
          },
          zIndex: 3,
        }}
      >
        <Box
          css={{
            width: '100%',
            px: '25px',
            pb: '25px',
            pt: '4.5px',
            lineHeight: '1',
          }}
        >
          <LogoBox />
        </Box>

        <SavedSearches {...props} />
        <Subscriptions {...props} />
        <Labels {...props} />
        <Box css={{ height: '250px ' }} />
      </Box>
      {/* This spacer pushes library content to the right of 
      the fixed left side menu. */}
      <Box
        css={{
          minWidth: LIBRARY_LEFT_MENU_WIDTH,
          height: '100%',
          bg: '$thBackground',
          '@mdDown': {
            display: 'none',
          },
        }}
      ></Box>
    </>
  )
}

function SavedSearches(props: LibraryFilterMenuProps): JSX.Element {
  const items = [
    {
      name: 'Inbox',
      term: 'in:inbox',
    },
    {
      name: 'Continue Reading',
      term: 'in:inbox sort:read-desc is:unread',
    },
    {
      name: 'Non-Feed Items',
      term: 'in:library',
    },
    {
      name: 'Highlights',
      term: 'has:highlights mode:highlights',
    },
    {
      name: 'Unlabeled',
      term: 'no:label',
    },
    {
      name: 'Oldest First',
      term: 'sort:saved-asc',
    },
    {
      name: 'Files',
      term: 'type:file',
    },
    {
      name: 'Archived',
      term: 'in:archive',
    },
  ]

  useRegisterActions(
    items.map((item, idx) => {
      const key = String(idx + 1)
      return {
        id: `saved_search_${key}`,
        name: item.name,
        shortcut: [key],
        section: 'Saved Searches',
        keywords: '?' + item.name,
        perform: () => {
          props.applySearchQuery(item.term)
        },
      }
    }),
    []
  )

  const [collapsed, setCollapsed] = usePersistedState<boolean>({
    key: `--saved-searches-collapsed`,
    initialValue: false,
  })

  return (
    <MenuPanel
      title="Saved Searches"
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      {!collapsed &&
        items.map((item) => (
          <FilterButton
            key={item.name}
            text={item.name}
            filterTerm={item.term}
            {...props}
          />
        ))}

      <Box css={{ height: '10px' }}></Box>
    </MenuPanel>
  )
}

function Subscriptions(props: LibraryFilterMenuProps): JSX.Element {
  const { subscriptions } = useGetSubscriptionsQuery()
  const [collapsed, setCollapsed] = usePersistedState<boolean>({
    key: `--subscriptions-collapsed`,
    initialValue: false,
  })

  useRegisterActions(
    (subscriptions ?? []).map((subscription, idx) => {
      const key = String(idx + 1)
      const name = subscription.name
      return {
        id: `subscription_${key}`,
        section: 'Subscriptions',
        name: name,
        keywords: '*' + name,
        perform: () => {
          props.applySearchQuery(`subscription:\"${name}\"`)
        },
      }
    }),
    [subscriptions]
  )

  return (
    <MenuPanel
      title="Subscriptions"
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      {!collapsed ? (
        <>
          <FilterButton filterTerm={`label:RSS`} text="Feeds" {...props} />
          <FilterButton
            filterTerm={`label:Newsletter`}
            text="Newsletters"
            {...props}
          />
          {(subscriptions ?? []).map((item) => {
            return (
              <FilterButton
                key={item.id}
                filterTerm={`subscription:\"${item.name}\"`}
                text={item.name}
                {...props}
              />
            )
          })}
          <EditButton
            title="Edit Subscriptions"
            destination="/settings/subscriptions"
          />
        </>
      ) : (
        <SpanBox css={{ mb: '10px' }} />
      )}
    </MenuPanel>
  )
}

function Labels(props: LibraryFilterMenuProps): JSX.Element {
  const { labels } = useGetLabelsQuery()
  const [collapsed, setCollapsed] = usePersistedState<boolean>({
    key: `--labels-collapsed`,
    initialValue: false,
  })

  const sortedLabels = useMemo(() => {
    return labels.sort((left: Label, right: Label) =>
      left.name.localeCompare(right.name)
    )
  }, [labels])

  return (
    <MenuPanel
      title="Labels"
      hideBottomBorder={true}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      {!collapsed && (
        <>
          {sortedLabels.map((item) => {
            return <LabelButton key={item.id} label={item} {...props} />
          })}
          <EditButton title="Edit Labels" destination="/settings/labels" />
        </>
      )}
    </MenuPanel>
  )
}

type MenuPanelProps = {
  title: string
  children: ReactNode

  hideBottomBorder?: boolean

  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

function MenuPanel(props: MenuPanelProps): JSX.Element {
  return (
    <VStack
      css={{
        m: '0px',
        width: '100%',
        borderBottom: props.hideBottomBorder
          ? '1px solid transparent'
          : '1px solid $thBorderColor',
        px: '15px',
      }}
      alignment="start"
      distribution="start"
    >
      <HStack css={{ width: '100%' }} distribution="start" alignment="center">
        <StyledText
          css={{
            fontFamily: 'Inter',
            fontWeight: '600',
            fontSize: '16px',
            lineHeight: '125%',
            color: '$thLibraryMenuPrimary',
            pl: '10px',
            mt: '20px',
            mb: '10px',
          }}
        >
          {props.title}
        </StyledText>
        <SpanBox
          css={{
            display: 'flex',
            height: '100%',
            mt: '10px',
            marginLeft: 'auto',
            verticalAlign: 'middle',
          }}
        >
          <Button
            style="articleActionIcon"
            onClick={(event) => {
              props.setCollapsed(!props.collapsed)
              event.preventDefault()
            }}
          >
            {props.collapsed ? (
              <ToggleCaretRightIcon
                size={15}
                color={theme.colors.thLibraryMenuPrimary.toString()}
              />
            ) : (
              <ToggleCaretDownIcon
                size={15}
                color={theme.colors.thLibraryMenuPrimary.toString()}
              />
            )}
          </Button>
        </SpanBox>
      </HStack>
      {props.children}
    </VStack>
  )
}

type FilterButtonProps = {
  text: string

  filterTerm: string
  searchTerm: string | undefined

  applySearchQuery: (searchTerm: string) => void

  setShowFilterMenu: (show: boolean) => void
}

function FilterButton(props: FilterButtonProps): JSX.Element {
  const isInboxFilter = (filter: string) => {
    return filter === '' || filter === 'in:inbox'
  }
  const selected = useMemo(() => {
    if (isInboxFilter(props.filterTerm) && !props.searchTerm) {
      return true
    }
    return props.searchTerm === props.filterTerm
  }, [props.searchTerm, props.filterTerm])

  return (
    <Box
      css={{
        pl: '10px',
        mb: '2px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '32px',

        backgroundColor: selected ? '$thLibrarySelectionColor' : 'unset',
        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: selected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
      }}
      title={props.text}
      onClick={(e) => {
        props.applySearchQuery(props.filterTerm)
        props.setShowFilterMenu(false)
        e.preventDefault()
      }}
    >
      {props.text}
    </Box>
  )
}

type LabelButtonProps = {
  label: Label
  searchTerm: string | undefined
  applySearchQuery: (searchTerm: string) => void
}

function LabelButton(props: LabelButtonProps): JSX.Element {
  const labelId = `checkbox-label-${props.label.id}`
  const state = useMemo(() => {
    const term = props.searchTerm ?? ''
    if (term.indexOf(`label:\"${props.label.name}\"`) >= 0) {
      return 'on'
    }
    return 'off'
  }, [props.searchTerm, props.label])

  return (
    <HStack
      css={{
        pl: '10px',
        pt: '2px', // TODO: hack to middle align
        width: '100%',
        height: '30px',

        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color:
          state == 'on'
            ? '$thLibraryMenuSecondary'
            : '$thLibraryMenuUnselected',

        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',

        m: '0px',
        '&:hover': {
          backgroundColor: '$thBackground4',
        },
      }}
      title={props.label.name}
      alignment="center"
      distribution="start"
    >
      <label
        htmlFor={labelId}
        style={{
          width: '100%',
          maxWidth: '170px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <Circle size={9} color={props.label.color} weight="fill" />
        <SpanBox css={{ pl: '10px' }}>{props.label.name}</SpanBox>
      </label>
      <SpanBox
        css={{
          ml: 'auto',
        }}
      >
        <input
          id={labelId}
          type="checkbox"
          checked={state === 'on'}
          onChange={(e) => {
            if (e.target.checked) {
              props.applySearchQuery(
                `${props.searchTerm ?? ''} label:\"${props.label.name}\"`
              )
            } else {
              const query =
                props.searchTerm?.replace(
                  `label:\"${props.label.name}\"`,
                  ''
                ) ?? ''
              props.applySearchQuery(query)
            }
          }}
        />
      </SpanBox>
    </HStack>
  )
}

type EditButtonProps = {
  title: string
  destination: string
}

function EditButton(props: EditButtonProps): JSX.Element {
  return (
    <Link href={props.destination} passHref>
      <SpanBox
        css={{
          ml: '10px',
          mb: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          '&:hover': {
            textDecoration: 'underline',
          },

          width: '100%',
          maxWidth: '100%',
          height: '32px',

          fontSize: '14px',
          fontWeight: 'regular',
          fontFamily: '$display',
          color: '$thLibraryMenuUnselected',
          verticalAlign: 'middle',
          borderRadius: '3px',
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {props.title}
      </SpanBox>
    </Link>
  )
}
