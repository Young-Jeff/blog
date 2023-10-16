---
slug: promise-write
title: Promise手写
date: 2021-07-12
authors: youngjeff
tags: [源码实现, 总结]
keywords: [源码实现, 总结]
description: Promise手写
---

> 代码块中的省略号，代表相较于上次代码未改动部分

## 1）核心逻辑实现

**分析：**

1. 根据调用方式可知，promise 是一个类，需要传递一个执行器进去，执行器会立即执行
2. promise 有三种状态，分别为成功-fulfilled 失败-rejected 等待-pending，一旦状态确定就不可改变 pending > fulfilled pending > rejected
3. resolve 和 reject 函数是用来改变状态的，resolve 是成功，reject 是失败；
4. then 接受两个参数，如果状态成功就调用成功回调函数（参数代表成功结果），否则就调用失败回调（参数代表失败原因）

**分析完毕，开搞：**

```
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  constructor(exector) {
    // exector是一个执行器，传入resolve和reject方法，进入会立即执行，
    exector(this.resolve, this.reject);
  }
  // 实例对象上属性，初始状态为等待
  status = PENDING;
  // 成功后的值
  value = undefined;
  // 失败后的原因
  reason = undefined;
  // 使用箭头函数，让this指向当前实例对象
  resolve = (value) => {
    // 判断状态不是等待，阻止执行
    if (this.status !== PENDING) return;
    // 将状态改为成功，并保存成功值
    this.status = FULFILLED;
    this.value = value;
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    // 将状态改为失败，并保存失败原因
    this.status = REJECTED;
    this.reason = reason;
  };
  then(successCallback, failCallback) {
    if (this.status === FULFILLED) {
      // 调用成功回调，把结果返回
      successCallback(this.value);
    } else if (this.status === REJECTED) {
      // 调用失败回调，把错误信息返回
      failCallback(this.reason);
    }
  }
}
```

## 2）加入异步处理逻辑

```
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  constructor(exector) {
    // exector是一个执行器，传入resolve和reject方法，进入会立即执行，
    exector(this.resolve, this.reject);
  }
  // 实例对象上属性，初始状态为等待
  status = PENDING;
  // 成功后的值
  value = undefined;
  // 失败后的原因
  reason = undefined;
  // 定义成功回调和失败回调参数
  successCallback = undefined;
  failCallback = undefined;
  // 使用箭头函数，让this指向当前实例对象
  resolve = (value) => {
    // 判断状态不是等待，阻止执行
    if (this.status !== PENDING) return;
    // 将状态改为成功，并保存成功值
    this.status = FULFILLED;
    this.value = value;
    this.successCallback && this.successCallback(this.value);
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    // 将状态改为失败，并保存失败原因
    this.status = REJECTED;
    this.reason = reason;
    this.failCallback && this.failCallback(this.reason);
  };
  then(successCallback, failCallback) {
    if (this.status === FULFILLED) {
      // 调用成功回调，把结果返回
      successCallback(this.value);
    } else if (this.status === REJECTED) {
      // 调用失败回调，把错误信息返回
      failCallback(this.reason);
    } else {
      // 等待状态，把成功和失败回调暂存起来
      this.successCallback = successCallback;
      this.failCallback = failCallback;
    }
  }
}
```

## 3）then 方法多次调用

- promise 的 then 是可以被多次调用的，
- 如下例子，如果三个 then 调用，都是同步调用，则直接返回值即可；
- 如果是异步调用，那么成功回调和失败回调应该是多个不同的；

```
let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 2000);
 })

 promise.then(value => {
   console.log(1)
   console.log('resolve', value)  //resolve success
 })

 promise.then(value => {
  console.log(2)
  console.log('resolve', value) //resolve success
})

promise.then(value => {
  console.log(3)
  console.log('resolve', value) //resolve success
})
```

所以需要改进：把回调放进数组，待状态确定后统一执行

```
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  constructor(exector) {
    // exector是一个执行器，传入resolve和reject方法，进入会立即执行，
    exector(this.resolve, this.reject);
  }
  // 实例对象上属性，初始状态为等待
  status = PENDING;
  // 成功后的值
  value = undefined;
  // 失败后的原因
  reason = undefined;
  // 定义成功回调和失败回调参数，初始化空数组
  successCallback = [];
  failCallback = [];
  // 使用箭头函数，让this指向当前实例对象
  resolve = (value) => {
    // 判断状态不是等待，阻止执行
    if (this.status !== PENDING) return;
    // 将状态改为成功，并保存成功值
    this.status = FULFILLED;
    this.value = value;
    while (this.successCallback.length) {
      this.successCallback.shift()(this.value);
    }
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    // 将状态改为失败，并保存失败原因
    this.status = REJECTED;
    this.reason = reason;
    while (this.failCallback.length) {
      this.failCallback.shift()(this.reason);
    }
  };
  then(successCallback, failCallback) {
    if (this.status === FULFILLED) {
      // 调用成功回调，把结果返回
      successCallback(this.value);
    } else if (this.status === REJECTED) {
      // 调用失败回调，把错误信息返回
      failCallback(this.reason);
    } else {
      // 等待状态，把成功和失败回调暂存到数组中
      this.successCallback.push(successCallback);
      this.failCallback.push(failCallback);
    }
  }
}
```

## 4）then 方法链式调用

- then 方法会返回一个新的 Promise 实例。因此可以采用链式写法
- then 方法可以返回一个普通值或者一个新的 promise 实例

返回普通值用法：

```
let promise = new Promise((resolve, reject) => {
  // 目前这里只处理同步的问题
  resolve('success');
});
promise
  .then((value) => {
    console.log('1', value); //  1 success
    return 'hello';
  })
  .then((value) => {
    console.log('2', value); //  2 hello
  });

```

返回新的 promise 实例用法：

```
let promise = new Promise((resolve, reject) => {
  // 目前这里只处理同步的问题
  resolve('success');
});
function other() {
  return new Promise((resolve, reject) => {
    resolve('other');
  });
}
promise
  .then((value) => {
    console.log('1', value); //  1 success
    return other();
  })
  .then((value) => {
    console.log('2', value); //  2 other
  });

```

**实现：**

```
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  constructor(exector) {
    exector(this.resolve, this.reject);
  }

  status = PENDING;
  value = undefined;
  reason = undefined;
  successCallback = [];
  failCallback = [];

  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    while (this.successCallback.length)
      this.successCallback.shift()(this.value);
  };

  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    while (this.failCallback.length) this.failCallback.shift()(this.reason);
  };

  then(successCallback, failCallback) {
    // then方法返回第一个promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // x是上一个promise回调函数的返回结果
        // 判断x是普通值还是promise实例
        // 如果是普通值，直接resolve
        // 如果是promise实例，待promise状态变为fulfilled，调用resolve或者reject

        // 因为mew MyPromise需要执行完才能拿到promise2，所以通过异步拿到
        setTimeout(() => {
          let x = successCallback(this.value);
          resolvePromise(promise2, x, resolve, reject);
        }, 0);
      } else if (this.status === REJECTED) {
        failCallback(this.reason);
      } else {
        this.successCallback.push(successCallback);
        this.failCallback.push(failCallback);
      }
    });
    return promise2;
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 如果等于了，说明返回了自身，报错
  if (promise2 === x) {
    return reject(
      new TypeError('Chaining cycle detected for promise #<Promise>')
    );
  }
  // 判断x是不是其实例对象
  if (x instanceof MyPromise) {
    x.then(
      (value) => resolve(value),
      (reason) => reject(reason)
    );
  } else {
    // 普通值
    resolve(x);
  }
}
```

## 5）捕获错误及优化

1. 捕获执行器中的错误

```
constructor(exector) {
    // 捕获错误，如果有错误就执行reject
    try {
      exector(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
```

**验证：**

```
let promise = new MyPromise((resolve, reject) => {
    // resolve('success')
    throw new Error('执行器错误')
})
promise.then(value => {
  console.log(1)
  console.log('resolve', value)
}, reason => {
  console.log(2)
  console.log(reason.message)
})
//2
//执行器错误
```

2. then 执行的时候报错捕获

```
then(successCallback, failCallback) {
    // then方法返回第一个promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        failCallback(this.reason);
      } else {
        this.successCallback.push(successCallback);
        this.failCallback.push(failCallback);
      }
    });
    return promise2;
  }
```

**验证：**

```
let promise = new MyPromise((resolve, reject) => {
  resolve('success');
});
// 第一个then方法中的错误要在第二个then方法中捕获到
promise
  .then(
    (value) => {
      console.log('1', value);
      throw new Error('then error');
    },
    (reason) => {
      console.log('2', reason.message);
    }
  )
  .then(
    (value) => {
      console.log('3', value);
    },
    (reason) => {
      console.log('4', reason.message);
    }
  );
// 1 success
// 4 then error
```

3. 错误后的链式调用

```
then(successCallback, failCallback) {
    // then方法返回第一个promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        this.successCallback.push(successCallback);
        this.failCallback.push(failCallback);
      }
    });
    return promise2;
  }
```

**验证：**

```
let promise = new MyPromise((resolve, reject) => {
  throw new Error('执行器错误');
});

// 第一个then方法中的错误要在第二个then方法中捕获到
promise
  .then(
    (value) => {
      console.log('1', value);
      throw new Error('then error');
    },
    (reason) => {
      console.log('2', reason.message);
      return 200;
    }
  )
  .then(
    (value) => {
      console.log('3', value);
    },
    (reason) => {
      console.log('4', reason.message);
    }
  );
// 2 执行器错误
// 3 200

```

4. 异步状态下链式调用（then 方法优化）

```
   ...
  resolve = (value) => {
   ...
    // 调用时，不再需要传值，因为在push回调数组时，已经处理了
    while (this.successCallback.length) this.successCallback.shift()();
  };
  reject = (reason) => {
    ...
    // 调用时，不再需要传值，因为在push回调数组时，已经处理了
    while (this.failCallback.length) this.failCallback.shift()();
  };

  then(successCallback, failCallback) {
    // then方法返回第一个promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        ...
      } else if (this.status === REJECTED) {
        ...
      } else {
        // 处理异步情况
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              let x = successCallback(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.failCallback.push(() => {
          setTimeout(() => {
            // 如果回调中报错的话就执行reject
            try {
              let x = failCallback(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
```

**验证：**

```
let promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功');
  }, 2000);
});
// 第一个then方法中的错误要在第二个then方法中捕获到
promise
  .then(
    (value) => {
      console.log('1', value);
      return 'hello';
    },
    (reason) => {
      console.log('2', reason.message);
      return 200;
    }
  )
  .then(
    (value) => {
      console.log('3', value);
    },
    (reason) => {
      console.log('4', reason.message);
    }
  );
// 1 成功
// 3 hello
```

## 6）把 then 方法的参数变成可选参数

```
var promise = new Promise((resolve, reject) => {
      resolve(100)
    })
    promise
      .then()
      .then()
      .then()
      .then(value => console.log(value))
// 在控制台最后一个then中输出了100

// 这个相当于
promise
  .then(value => value)
  .then(value => value)
  .then(value => value)
  .then(value => console.log(value))
```

**所以修改 then 方法：**

```
 then(successCallback, failCallback) {
    // 先判断回调函数是否传了,如果没预留就默认一个函数，把参数返回
    successCallback = successCallback ? successCallback : (value) => value;
    failCallback = failCallback  ? failCallback : (reason) => {  throw reason };
    ...
  }
```

## 7）实现 Promise.all promise.all 方法是解决异步并发问题的

```
// 如果p1是两秒之后执行的，p2是立即执行的，那么根据正常的是p2在p1的前面。
// 如果我们在all中指定了执行顺序，那么会根据我们传递的顺序进行执行。
function p1 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1')
    }, 2000)
  })
}
function p2 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('p2')
    },0)
  })
}
Promise.all(['a', 'b', p1(), p2(), 'c']).then(result => {
  console.log(result)
  // ["a", "b", "p1", "p2", "c"]
})
```

**分析：**

- all 方法接收一个数组，数组中可以是普通值也可以是 promise 对象
- 数组中值得顺序一定是我们得到的结果的顺序
- 返回值也是一个 promise 对象，可以调用 then 方法
- 如果数组中所有值是成功的，那么 then 里面就是成功回调，如果有一个值是失败的，那么 then 里面就是失败的
- 使用 all 方法是用类直接调用，那么 all 一定是一个静态方法

**分析完，开整：**

```
class MyPromise {
  ...
  static all(array) {
    // 结果数组
    let result = [];
    // 计数器
    let index = 0;
    return new MyPromise((resolve, reject) => {
      let addData = (key, value) => {
        result[key] = value;
        index++;
        // 当计数器等于参数数组的长度，说明所有参数已经执行完毕
        if (index === array.length) {
          resolve(result);
        }
      };
      // 对传递的数组中遍历
      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        if (current instanceof MyPromise) {
          current.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          );
        } else {
          addData(i, array[i]);
        }
      }
    });
  }
}
```

**验证：**

```
function p1() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1');
    }, 2000);
  });
}

function p2() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('p2');
    }, 0);
  });
}
Promise.all(['a', 'b', p1(), p2(), 'c']).then((result) => {
  console.log(result);
  // ["a", "b", "p1", "p2", "c"]
});
```

## 8）实现 Promise.resolve

**分析：**

- 如果参数是一个 promise 对象，则直接返回；如果是一个值，则生成一个 promise 对象，把值进行返回
- 肯定是一个静态方法

```
class MyPromise {
  ...
  // Promise.resolve方法
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    } else {
      return new MyPromise((resolve) => resolve(value));
    }
  }
}
```

**验证：**

```
function p1() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1');
    }, 2000);
  });
}

Promise.resolve(100).then((value) => console.log(value));
Promise.resolve(p1()).then((value) => console.log(value));
// 100
// 2s 之后输出 p1
```

## 9）实现 finally 方法

- 无论最终状态是成功或是失败，finally 都会执行
- 可以在 finally 之后拿到 then 的结果
- 这是原型上的方法

```
  // finally
  // 使用then方法拿到promise的状态，无论成功或失败都返回callback
  // then方法返回的就是一个promise，拿到成功回调就把value return，错误回调就把错误信息return
  // 如果callback是一个异步promise，还需等待其执行完毕，所以要用到静态方法resolve
  finally(callback) {
    return this.then(
      (value) => {
        return MyPromise.resolve(callback()).then(() => value);
      },
      (reason) => {
        return MyPromise.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }
```

**验证：**

```
function p1() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1');
    }, 2000);
  });
}
function p2() {
  return new MyPromise((resolve, reject) => {
    reject('p2 reject');
  });
}
p2()
  .finally(() => {
    console.log('finallyp2');
    return p1();
  })
  .then(
    (value) => {
      console.log('成功回调', value);
    },
    (reason) => {
      console.log('失败回调', reason);
    }
  );
// finallyp2
// 两秒之后执行p2 reject
```

## 10）实现 catch 方法

- 可以捕获全局错误
- 也是原型对象的方法

```
 // 直接调用then方法，然后成功的地方传递undefined，错误的地方传递reason
  catch(failCallback) {
    return this.then(undefined, failCallback);
  }
```

---

## Promise 全部代码

```
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  constructor(exector) {
    // 捕获错误，如果有错误就执行reject
    try {
      exector(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  status = PENDING;
  value = undefined;
  reason = undefined;
  successCallback = [];
  failCallback = [];

  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    // 调用时，不再需要传值，因为在push回调数组时，已经处理了
    while (this.successCallback.length) this.successCallback.shift()();
  };

  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    // 调用时，不再需要传值，因为在push回调数组时，已经处理了
    while (this.failCallback.length) this.failCallback.shift()();
  };

  then(successCallback, failCallback) {
    // 先判断回调函数是否传了,如果没预留就默认一个函数，把参数返回
    successCallback = successCallback ? successCallback : (value) => value;
    failCallback = failCallback
      ? failCallback
      : (reason) => {
          throw reason;
        };
    // then方法返回第一个promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // x是上一个promise回调函数的返回结果
        // 判断x是普通值还是promise实例
        // 如果是普通值，直接resolve
        // 如果是promise实例，待promise状态变为fulfilled，调用resolve或者reject

        // 因为mew MyPromise需要执行完才能拿到promise2，所以通过异步拿到
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        // 处理异步情况
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              let x = successCallback(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.failCallback.push(() => {
          setTimeout(() => {
            // 如果回调中报错的话就执行reject
            try {
              let x = failCallback(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }

  static all(array) {
    // 结果数组
    let result = [];
    // 计数器
    let index = 0;
    return new MyPromise((resolve, reject) => {
      let addData = (key, value) => {
        result[key] = value;
        index++;
        // 当计数器等于参数数组的长度，说明所有参数已经执行完毕
        if (index === array.length) {
          resolve(result);
        }
      };

      // 对传递的数组中遍历
      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        if (current instanceof MyPromise) {
          current.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          );
        } else {
          addData(i, array[i]);
        }
      }
    });
  }
  // Promise.resolve方法
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    } else {
      return new MyPromise((resolve) => resolve(value));
    }
  }
  // finally
  // 使用then方法拿到promise的状态，无论成功或失败都返回callback
  // then方法返回的就是一个promise，拿到成功回调就把value return，错误回调就把错误信息return
  // 如果callback是一个异步promise，还需等待其执行完毕，所以要用到静态方法resolve
  finally(callback) {
    return this.then(
      (value) => {
        return MyPromise.resolve(callback()).then(() => value);
      },
      (reason) => {
        return MyPromise.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }
  // catch
  // 直接调用then方法，然后成功的地方传递undefined，错误的地方传递reason
  catch(failCallback) {
    return this.then(undefined, failCallback);
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 如果等于了，说明返回了自身，报错
  if (promise2 === x) {
    return reject(
      new TypeError('Chaining cycle detected for promise #<Promise>')
    );
  }
  // 判断x是不是其实例对象
  if (x instanceof MyPromise) {
    x.then(
      (value) => resolve(value),
      (reason) => reject(reason)
    );
  } else {
    // 普通值
    resolve(x);
  }
}

```
