import * as utils from '../../src/utils'

describe('[Get] Utils.js', () => {
  it('should get a simple key on an object', () => {
    const obj = { name: 'John', age: 30, car: null }
    const name = utils.get(obj, 'name')
    expect(name).toEqual(obj.name)
  })

  it('should get a deep key on an object', () => {
    const obj = { pages: [{ title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    expect(utils.get(obj, 'pages.0.title')).toEqual(obj.pages[0].title)
  })

  it('should get a deep key on an object using a variable', () => {
    const obj = { pages: [{ title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    expect(utils.get(obj, 'pages.{index}.title', { index: 0 })).toEqual(obj.pages[0].title)
  })

  it('should get a deep key on an object using a variable path', () => {
    const obj = { pages: [{ title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    expect(utils.get(obj, 'pages.{index.of.page.one}.title', { index: { of: { page: { one: 0 } } } })).toEqual(obj.pages[0].title)
  })

  it('should get a deep key on a sub array using a key/value variable path', () => {
    const obj = { pages: [{ slug: 'once', title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    expect(utils.get(obj, `pages.{'slug':slug}.title`, { slug: 'once' })).toEqual(obj.pages[0].title)
  })

  it('should get a deep key on a sub array using a key/value variables path', () => {
    const obj = { pages: [{ slug: 'once', title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    expect(utils.get(obj, `pages.{key:slug}.title`, { key: 'slug', slug: 'once' })).toEqual(obj.pages[0].title)
  })

  it('should get a deep key on a sub object using a key/value variables path', () => {
    const obj = {
      pages: {
        123: { id: 123, slug: 'once', title: 'Once uppon a time', elements: [{ type: 'button' }] },
      },
    }
    expect(utils.get(obj, `pages.{key:slug}.title`, { key: 'slug', slug: 'once' })).toEqual(obj.pages['123'].title)
  })
})

describe('[Set] Utils.js', () => {
  it('should set a simple key on an object', () => {
    const obj = { name: 'John', age: 30, car: null }
    utils.set(obj, 'name', 'Charlotte')
    expect(obj.name).toEqual('Charlotte')
  })

  it('should set a deep key on an object', () => {
    const obj = { pages: [{ title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    utils.set(obj, 'pages.0.title', 'Another time')
    expect(obj.pages[0].title).toEqual('Another time')
  })

  it('should get a deep key on an object using a variable', () => {
    const obj = { pages: [{ title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    utils.set(obj, 'pages.{index}.title', 'Another time', { index: 0 })
    expect(obj.pages[0].title).toEqual('Another time')
  })

  it('should get a deep key on an object using a variable path', () => {
    const obj = { pages: [{ title: 'Once uppon a time', elements: [{ type: 'button' }] }] }
    utils.set(obj, 'pages.{index.of.page.one}.title', 'Another time', { index: { of: { page: { one: 0 } } } })
    expect(obj.pages[0].title).toEqual('Another time')
  })

  it('should set an array item on an object', () => {
    const obj = { name: 'John', age: 30, car: null }
    utils.set(obj, 'car.0', { color: 'blue' })
    expect(obj.car[0]).toEqual({ color: 'blue' })
  })

  it('should set an integer key on an object', () => {
    const obj = { name: 'John', age: 30, car: null }
    utils.set(obj, 'car.^0.details', { color: 'blue' })
    expect(obj.car['0'].details).toEqual({ color: 'blue' })
  })

  it('should set a prop in an array item on an object', () => {
    const obj = { name: 'John', age: 30, car: null }
    utils.set(obj, 'car.0.color', 'blue')
    expect(obj.car[0].color).toEqual('blue')
  })
})
