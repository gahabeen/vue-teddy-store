import { setGetters, resolve, setState } from '@/index'

import { nanoid } from 'nanoid'







describe('methods - resolve', () => {
  it('resolve() should retrieve a simple getter', async () => {
    const space = nanoid()
    const name = nanoid()
    setGetters(
      { space, name },
      {
        addition: () => 1 + 1,
      }
    )
    expect(resolve({ space, name }, 'addition').value).toBe(2)
  })

  it('resolve() should retrieve a getter based on inputs', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      age: 18,
    }
    setState({ space, name }, state)

    setGetters(
      { space, name },
      {
        ageLimit: ({ state }, { gap }) => state.age + gap,
      }
    )
    expect(resolve({ space, name }, 'ageLimit', { gap: 3 }).value).toBe(state.age + 3)
  })
})
