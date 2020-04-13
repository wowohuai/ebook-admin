import request from '@/utils/request'

export const createBook = (book) => {
  return request({
    url: '/book/create',
    method: 'POST',
    data: book
  })
}

export const updateBook = (book) => {
  return request({
    url: '/book/update',
    method: 'POST',
    data: book
  })
}

export const getBook = fileName => {
  return request({
    url: '/book/info',
    method: 'POST',
    data: fileName
  })
}

export const getCategory = () => {
  return request({
    url: '/book/category',
    method: 'GET'
  })
}

export const getList = (params) => {
  return request({
    url: '/book/list',
    method: 'GET',
    params
  })
}
// 移除上传的资源文件
export const removeBook = (data) => {
  return request({
    url: '/book/remove',
    method: 'POST',
    data
  })
}

export const deleteBook = (data) => {
  return request({
    url: '/book/delete',
    method: 'POST',
    data
  })
}
