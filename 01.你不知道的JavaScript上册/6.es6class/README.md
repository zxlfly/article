# class
类是一种可选的设计模式，在JavaScript中实现类很别扭。这种别扭不只是来源于语法，繁琐杂乱的prototype引用、试图调用原型链上层同名函数时的显式伪多态以及不可靠、不美观而且容易被误解成‘构造函数’的constructor。  
JavaScript中父类和子类之间不是复制的关系，只有引用（委托）。  

es6中class除了语法更好看之外
- 不再引用杂乱的prototype了
- 不需要手动的使用Object.create来替换prototype对象，也不需要设置__proto__或者Object.setPrototypeOf
- 可以使用super来实现相对多态，这样任何方法都可以引用原型链上层的同名方法。
- 可以通过extends很自然的扩展对象（子）类型，甚至是内置对象（子）类型
- 这只是语法糖，本质不是复制还是引用！！！
- 类的声明不会提升
- 默认处于严格模式

## super
super和this不一样不是动态绑定的，他会在声明的时候“静态”绑定。
```
class P{
    foo(){console.log("p foo")}
}
class C extends P{
    foo(){
        super.foo();
    }
} 
var c1 =new C()
c1.foo()//p foo

var D ={
    foo:function(){console.log('D foo')}
}
var E ={
    foo:C.prototype.foo
}
//把E委托给D
Object.setPrototypeOf(E,D)
E.foo()//p foo
```
如果认为super会动态绑定，那super会自动识别出E委托了D，所以应该调用D.foo。  
但是不是这样的。出于性能考虑，super在[[HomeObject]].[[prototype]]上，[[HomeObject]]会在创建时静态绑定。  
本例中，super会调用P，因为方法的[[HomeObject]]任然是C，C.[[prototype]]是P。  
如果使用了bind函数来绑定，那么这个函数不会像普通的函数那样被es6的extends拓展到子类中。
## 公共方法
### 静态方法
关键字static将为一个类定义一个静态方法。静态方法不会在实例中被调用，而只会被类本身调用。
```
class ClassWithStaticMethod {
  static staticProperty = 'someValue';
  static staticMethod() {
    return 'static method has been called.';
  }
  static {
    console.log('Class static initialization block called');
  }
}

console.log(ClassWithStaticMethod.staticProperty);
// output: "someValue"
console.log(ClassWithStaticMethod.staticMethod());
// output: "static method has been called."
```
### 公共实例方法
公共实例方法是可以在类的实例中使用的。在实例的方法中，this指向的是实例本身，可以使用super访问到超类的原型，由此可以调用超类的方法。
```
class ClassWithPublicInstanceMethod {
  publicMethod() {
    return 'hello world';
  }
}
const instance = new ClassWithPublicInstanceMethod();
console.log(instance.publicMethod());
// "hello worl​d"
```

## 公有字段
静态公有字段和实例公有字段都是可编辑的，可遍历的，可配置的。它们本身不同于私有对应值（private counterparts）的是，它们参与原型的继承。
### 静态公有字段
使用关键字 static 声明，类的构造函数访问静态公有字段。。不会在子类里重复初始化，但我们可以通过原型链访问它们。
```
class ClassWithStaticField {
  static staticField = 'static field';
}
console.log(ClassWithStaticField.staticField);
// "static field"​
```
### 公有实例字段
公有实例字段存在于类的每一个实例中。通过声明一个公有字段，我们可以确保该字段一直存在，而类的定义则会更加像是自我描述。
```
class ClassWithInstanceField {
  // 没有设定初始化程序的字段将默认被初始化为undefined。
  instanceField = 'instance field';
}
const instance = new ClassWithInstanceField();
console.log(instance.instanceField);
// "instance field"
```
## 私有字段
### 静态私有字段
静态私有字段可以在类声明本身内部的构造函数上被访问到。静态变量只能被静态方法访问的限制依然存在。
```
class ClassWithPrivateStaticField {
  static #PRIVATE_STATIC_FIELD;

  static publicStaticMethod() {
    ClassWithPrivateStaticField.#PRIVATE_STATIC_FIELD = 42;
    return ClassWithPrivateStaticField.#PRIVATE_STATIC_FIELD;
  }
}

console.log(ClassWithPrivateStaticField.publicStaticMethod() === 42)
```
### 私有实例字段
私有实例字段是通过# names句型（读作“哈希名称”）声明的，即为识别符加一个前缀“#”。“#”是名称的一部分，也用于访问和声明。

封装是语言强制实施的。引用不在作用域内的 # names 是语法错误。

```
class ClassWithPrivateField {
  #privateField;

  constructor() {
    this.#privateField = 42;
  }
  getInfo(){
      return this.#privateField
  }
}
const instance = new ClassWithPrivateField();
instance.getInfo() === 42 // true
instance.#privateField === 42; // 不能在class外访问，只能通过class里进行访问
```
## 私有方法
### 静态私有方法
和静态公共方法一样，静态私有方法也是在类里面而非实例中调用的。和静态私有字段一样，它们也只能在类的声明中访问。

你可以使用生成器（generator）、异步和异步生成器方法。

静态私有方法可以是生成器、异步或者异步生成器函数。
```
class ClassWithPrivateStaticMethod {
    static #privateStaticMethod() {
        return 42;
    }

    static publicStaticMethod() {
        return ClassWithPrivateStaticMethod.#privateStaticMethod();
    }
}

console.log(ClassWithPrivateStaticMethod.publicStaticMethod() === 42);
```
### 私有实例方法
私有实例方法在类的实例中可用，它的访问方式的限制和私有实例字段相同。
```
class ClassWithPrivateMethod {
  #privateMethod() {
    return 'hello world';
  }

  getPrivateMessage() {
      return this.#privateMethod();
  }
}

const instance = new ClassWithPrivateMethod();
console.log(instance.getPrivateMessage());
// 预期输出值: "hello worl​d"
```
私有实例方法可以是生成器、异步或者异步生成器函数。私有getter和setter也是可能的
```
class ClassWithPrivateAccessor {
  #message;

  get #decoratedMessage() {
    return `${this.#message}`;
  }
  set #decoratedMessage(msg) {
    this.#message = msg;
  }

  constructor() {
    this.#decoratedMessage = 'hello world';
    console.log(this.#decoratedMessage);
  }
}

new ClassWithPrivateAccessor();
// 预期输出值: "hello worl​d"

```
