import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import { reactions, publicChannels } from '@quiet/state-manager'

const QUICK_REACTIONS = ['👍', '👎', '😄', '🎉', '😕', '❤️']

const PREFIX = 'MessageReactionBar'
const classes = {
  bar: `${PREFIX}-bar`,
  pill: `${PREFIX}-pill`,
  pillActive: `${PREFIX}-pillActive`,
  addBtn: `${PREFIX}-addBtn`,
  picker: `${PREFIX}-picker`,
  pickerEmoji: `${PREFIX}-pickerEmoji`,
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.bar}`]: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '4px',
  },
  [`& .${classes.pill}`]: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  [`& .${classes.pillActive}`]: {
    border: `1px solid ${theme.palette.primary.main}`,
    background: `${theme.palette.primary.main}22`,
  },
  [`& .${classes.addBtn}`]: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.divider}`,
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: theme.palette.text.secondary,
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  [`& .${classes.picker}`]: {
    position: 'absolute',
    zIndex: 1000,
    display: 'flex',
    gap: '4px',
    padding: '8px',
    borderRadius: '8px',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[4],
  },
  [`& .${classes.pickerEmoji}`]: {
    fontSize: '20px',
    padding: '4px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
}))

interface Props {
  messageId: string
}

export const MessageReactionBar: React.FC<Props> = ({ messageId }) => {
  const dispatch = useDispatch()
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const groups = useSelector(reactions.selectors.selectReactionsForMessage(messageId))
  const channelId = useSelector(publicChannels.selectors.currentChannelId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const react = (emoji: string) => {
    if (!channelId) return
    dispatch(reactions.actions.sendReaction({ targetMessageId: messageId, emoji, channelId }))
    setPickerOpen(false)
  }

  return (
    <StyledGrid>
      <div className={classes.bar}>
        {groups.map(group => (
          <Tooltip key={group.emoji} title={group.nicknames.join(', ')}>
            <button
              className={`${classes.pill} ${group.reacted ? classes.pillActive : ''}`}
              onClick={() => react(group.emoji)}
            >
              {group.emoji} {group.count}
            </button>
          </Tooltip>
        ))}
        <div style={{ position: 'relative' }} ref={pickerRef}>
          <button className={classes.addBtn} onClick={() => setPickerOpen(v => !v)}>
            🙂+
          </button>
          {pickerOpen && (
            <div className={classes.picker}>
              {QUICK_REACTIONS.map(emoji => (
                <button key={emoji} className={classes.pickerEmoji} onClick={() => react(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </StyledGrid>
  )
}

export default MessageReactionBar
