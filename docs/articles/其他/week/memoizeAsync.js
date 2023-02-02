function memoizeAsync(fn, getKey) {
  const memo = {},
    progressQueues = {};

  return function memoized(...allArgs) {
    const callback = allArgs[allArgs.length - 1];
    const args = allArgs.slice(0, -1);
    const key = getKey(...args);

    if (memo.hasOwnProperty(key)) {
      callback(key);
      return;
    }

    if (!progressQueues.hasOwnProperty(key)) {
      progressQueues[key] = [callback];
    } else {
      progressQueues[key].push(callback);
      return;
    }

    fn.call(this, ...args, (data) => {
      memo[key] = data;
      for (let callback of progressQueues[key]) {
        callback(data);
      }
      // clean up progressQueues
      delete progressQueue[key];
    });
  };
}

const memoExpensiveOperation = memoizeAsync(expensiveOperation, (key) => key);
memoExpensiveOperation(key, callback)
