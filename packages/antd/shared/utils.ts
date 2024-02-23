import { VALID_ROW_COLS } from './constants'

export const validateRowCol = (rowCol: number) => {
  if (!VALID_ROW_COLS.includes(rowCol)) {
    throw new Error(`rowCol value must be one of ${VALID_ROW_COLS.join(", ")}. Received ${rowCol}`)
  }
}
