const errorHandler = (error: any, message?: string) => {
  console.error(error)
  return {
    success: false,
    error: (message || error.message) as string,
    data: null,
  }
}

export default errorHandler
