'use client'

import { create, lintSource, sourceOpen } from '@/app/actions'
import { Button } from '@mui/material'
import { useContentsStore, useLintResultStore } from '../ContentsStore'

export function ActionButton() {
  const { setContent, } = useContentsStore();

  const handleClick = async() => {
    const src = await sourceOpen('C:\\Users\\Hansol\\Desktop\\watchdog\\core.py');
    setContent(src);
  }

  return (
    <Button
      onClick={handleClick}
    >
      console
    </Button>
  )
}

export function VarifyButton() {
  const content = useContentsStore((state) => state.content);
  const setLintResult = useLintResultStore((state) => state.setLintResult);

  const handleClick = async() => {
    const result = await lintSource(content);
    setLintResult(result);
  }

  return (
    <Button onClick={handleClick}>
      Varify
    </Button>
  )
}