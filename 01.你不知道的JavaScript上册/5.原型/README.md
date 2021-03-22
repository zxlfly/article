# 原型
## [[prototype]]
**JavaScript中的对象有一个特殊的[[prototype]]内置属性，其实就是对于其他对象的引用。**几乎所有对象在创建时[[prototype]]都会被赋值一个非空值。
```
var obj ={
    a:2
}
obj.a//2
```
对于默认的[[Get]]操作来说，第一步是在对象本身查找是否有这个属性，如果有就使用它。如果没有就需要使用对象的[[prototype]]链了。  
```
var another = {
    a:2
}
var obj = Object.create(another)
obj.a//2
```
它会创建一个对象并且把这个对象的[[prototype]]关联到指定的对象。  
``for..in``遍历对象时原理和查找[[prototype]]链类似，任何可以通过原型链访问到的可枚举属性都会被枚举。使用``in``操作符的时候同样会查找原型链，区别在于它不管是否可枚举。
### Object.prototype
所有普通的[[prototype]]链最终都会指向内置的``Object.prototype``。
### 属性设置和屏蔽
```
obj.foo="666"
```
如果obj上面有名为foo的普同数据访问属性，这条赋值语句只会修改已有的属性值。  
如果没有，就回去原型链上找，遍历原型链，类似[[Get]]操作。  
如果原型链上面找不到，foo就会被直接添加到obj上。  
如果原型链上面有呢？  
- 如果在原型链上面存在名为foo的普通数据访问属性并且没有被标记为只读，那就会直接在obj中添加一个。后面就访问不到原型链上面的foo了，自己有了就会屏蔽掉上层的。
- 如果在原型链上面存在名为foo的普通数据访问属性但是他被标记为只读，那么无法修改已有属性或者在obj上创建屏蔽属性。
  - 如果是严格模式下会抛出错误，否则被忽略
- 如果在原型链上面存在名为foo并且它是一个setter，那就一定会调用这个setter。foo不会添加到obj本身，也不会重新定义这个setter。

关于上面说的第二种情况，主要是为了模拟类的继承。可以把原型链上层的foo看作是父类中的属性，它会被obj继承（复制），这样一来obj中的foo属性也是只读的。所以无法创建。实际上并不会发生类似的继承复制（是引用）。这个限制只存在于赋值操作中，使用Object.defineProperty(..)并不会收到影响。  
```
var another ={a:2}
var obj = Object.create(another)
another.a//2
obj.a//2
another.hasOwnProperty('a')//true
obj.hasOwnProperty('a')//false
obj.a++
another.a//2
obj.a//3
obj.hasOwnProperty('a')//true
```
尽管看起来这个++操作应该查找并增加another.a属性，但是实际上是obj.a=obj.a+1因此++操作首次会想通过原型链查找属性a并从another.a获取当前属性值2，然后给这个值+1，接着用[[Put]]将值3赋值给obj中新建的屏蔽属性a！！！  
修改委托属性时一定要注意这一点。不能直接这样修改，只能是another.a++。

## 类
JavaScript和面向类的语言不同，它并没有类来作为对象的抽象模式或者说蓝图。**JavaScript中只有对象**。  
实际上，JavaScript才是真正应该被称为面向对象的语言，因为它是少有可以不通过类，直接创建对象的语言。
### 类函数
```
function Foo(){}
Foo.prototype
```
**所有函数默认都会拥有一个名为``prototype``的共有且不可枚举的属性，它会指向一个对象。**  
这个对象通常被称为Foo的原型，因为我们通过名为Foo.prototype的属性引用来访问它。  
```
function Foo(){}
var a = new Foo()
Object.getownPrototypeOf(a)===Foo.prototype//true
```
通过new Foo()创建的每个对象将被[[Prototype]]链接到这个Foo.prototype对象。  
在JavaScript中，并没有类似的类的复制机制。只能创建对个对象，它们的[[Prototype]]是关联的同一个对象。但是在默认情况下并不会进行复制，因此这些对象之间并不会完全失去联系，是相互关联的。  
上面的例子最后我们得到了两个对象，它们之间相互关联。并没有初始化一个类，只是让两个对象互相关联。  
new Foo()这个操作实际上并没有直接创建关联，只是间接的完成了我们的目标：一个关联到其他对象的新对象。
#### 关于名称
就JavaScript中不会将一个对象复制到另一个对象，只是将他们关联起来。  
这个机制通常被称为原型继承。  
它常常被视为动态语言版本的类继承。这个名称主要是为了应对面向类的世界中的继承的意义。  
继承以为着复制操作，JavaScript并不会复制对象属性。相反，会在两个对象之间创建一个关联，这样一个对象就可以通过委托访问另一个对象的属性和函数。  
委托这个术语可以更加准确的描述JavaScript中对象的关联机制。  
差异继承本质上也是通过委托获取通用的属性。
### 构造函数
```
function Foo(){}
Foo.prototype.constructor === Foo//true
var a = new Foo()
a.constructor=== Foo//true
```
让大家觉得Foo是一个类可能就是因为new。  
Foo.prototype默认（在第一行代码声明时）有一个共有并且不可枚举的属性.constructor，这个属性引用的是对象关联的函数（这个例子是Foo）。此外通过构造函数调用new Foo()创建的对象也有一个.constructor属性，指向创建这个对象的函数。  
实际上a.constructor这个属性是不存在的。它只是指向Foo函数。这也不能表示a由Foo构造。  
实际上，Foo和程序中的其他函数没任何区别。函数本身不是构造函数，然而当在普通函数调用前面加上new关键字之后，就会把这个函数变成一个“构造函数调用”。  
实际上，new会劫持所有普通函数并用构造对象的形式来调用它。
```
function Nothing(){
    console.log('Don`t mind me!')
}
var a = new Nothing()
//Don`t mind me!
a//{}
```
Nothing只是一个普通的函数，但是使用new调用的时候，就会构造一个对象并赋值给a，这看起来是new的一个副作用（无论如何都会构造一个对象）。这个调用是一个构造函数调用，但是Nothing本身不是。  
换句话说，就是**JavaScript中对于构造函数的解释是，所有带new的函数调用。**  
**函数不是构造函数，但是当且仅当使用new时，函数调用会变成‘构造函数调用’。**

### 技术
```
function Foo(name){
    this.name=name
}
Foo.prototype.myName=function(){
    return this.name
}
var a = new Foo('a')
var b = new Foo('b')
a.myName()//a
b.myName()//b
```
这段代码中的this.name=name给每个对象都添加了.name属性，有点像类实例封装的数据值。  
Foo.prototype.myName=...这段代码会给Foo.prototype对象添加一个属性，创建对象的过程中新对象内部的[[prototype]]都会关联到Foo.prototype上。当a和b中无法找到myName时，就会通过委托的方式在Foo.prototype上找到。  
**前面说a.constructor===Foo为真，意味着a确实有一个指向Foo的.constructor属性，但事实不是这样的。**  
**a.constructor只是通过默认的[[prototype]]委托指向Foo，这和构造毫无关系。**  
举例来说，Foo.prototype的.constructor属性只是Foo函数在声明时的默认属性。**如果我们创建一个新的对象并替换了函数默认的.prototype对象引用，那么新对象并不会自动获得.constructor属性。**
```
function Foo(){}
Foo.prototype={}
var a = new Foo()
a.constructor===Foo//false
a.constructor===Object//false
```
这个例子a.constructor没有就会通过原型链网上找，Foo.prototype也没有，然后继续找，到了顶端Object.prototype。这个有.constructor属性，指向内置的Object(..)函数。  
当然也可以手动的给Foo.prototype添加一个，需要加一个符合正常行为不可枚举属性。
```
function Foo(){}
Foo.prototype={}
Object.defineProperty(Foo.prototype,"constructor",{
    enumerable:false,
    writable:true,
    configurable:true,
    value:foo//让.constructor指向Foo
})
```
**实际上，对象的.constructor属性默认指向一个函数,这个函数也有一个叫做.prototype的引用指向这个对象。‘构造函数’和‘原型’这两个词默认只有松散的含义，实际的值可能适用也可能不适用。最好的办法是记住“constructor并不表示（对象）被(它)构造”。**  
.constructor并不是一个不可变属性。它是不可枚举的，但是它的值是可写的。此外，可以给任意的原型链中的任意对象添加一个名为constructor的属性或者对其进行修改，任意赋值。  
## 继承（原型）
```
function Foo(name){
    this.name=name
}
Foo.prototype.myName=function(){
    return this.name
}
function Bar(name,label){
    Foo.call(this,name)
    this.label=label
}
//创建一个新的Bar.prototype对象并关联到Foo.prototype
Bar.prototype=Object.create(Foo.prototype)
// 注意，现在没有Bar.prototype.constructor了
// 原来的prototype被抛弃了，新的不会自动赋值
// 如果打印的话会是原型链上面的不会是Bar
// 如果需要的话，那就得手动修复
Bar.prototype.myLabel=function(){
    return this.label
}
var a =new Bar('a','obj a')
a.myName()//'a'
a.myLabel()//'obj a'
```
上面Object.create的做法是创建了一个新对象然后把就得对象抛弃了（不能修改默认的对象），然后赋值新的对象。  
如果直接使用``Bar.prototype=Foo.prototype``只是替换了引用，操作的时候容易修改``Foo.prototype``对象本身。  
如果使用``Bar.prototype=new Foo()``会创建一个关联到``Foo.prototype``的新对象。但是它使用了Foo的**构造函数调用**，如果函数Foo有一些副作用就会影响Bar()的后代。  
在es6之前有一个方法来修改对象原型链的关联，但是这个方法并不是标准无法兼容所有浏览器``__proto__``。  
ES6新增了辅助函数``Object.setPrototypeOf``来修改关联。  
**``__proto__``属性引用了内部的[[prototype]]对象。**  
它看起来就像一个属性，但是实际上更像是一个getter/setter。
```
//大致实现
Object.defineProperty(Object.prototype,"__proto__",{
    get:function(){
        return Object.getPrototypeOf(this)
    },
    set:function(v){
        Object.setPrototypeOf(this,v)
        return v
    }
})
```
```
//es6之前需要抛弃默认的Bar.prototype
Bar.prototype=Object.create(Foo.prototype)
//es6可以直接修改
Object.setPrototypeOf(Bar.prototype,Foo.prototype)
```
如果忽略掉Object.create带来的轻微性能损失（抛弃的对象需要进行垃圾回收），它实际上比es6的方法更短可读性更高。
### 检查类关系
假设对象有a，如何寻找对象a委托的对象？在传统的面向类的语言里，检查一个实例的继承祖先通常被称为内省或者反射。
```
a instanceof Foo
```
instanceof操作符的左侧操作是一个普通的对象，右操作是一个函数。a的原型链中是否存在Foo.prototype指向的对象。**这个方法只能处理对象（a）和函数（Foo）之间的关系**。如果是判断两个对象之间是否通过原型链关联是不行的。  
如果使用.bind来生成一个绑定函数，该函数是没有prototype属性的。如果使用instanceof的话，目标函数的prototype会代替硬绑定函数的prototype。  
非常简单的判断出两个对象之间存在的关系
```
a.isPrototypeOf(c)
```
也可以直接获取对象的原型链
```
Object.getPrototypeOf(a)
```
关于``__proto__``其实很多浏览器还是支持的。
```
a.__proto__
```
和之前说的constructor一样，实际是不存在与正在使用的对象中，实际上，它和其他常用函数一样内置于Object.prototype中。不可枚举。  
es6中新增了class关键字，后面会介绍。

## 对象关联
**prototype机制就是存在与对象中的一个内部链接，它会引用其他对象。作用是：如果在对象上没有找到需要的属性或者方法引用，引擎就会继续在prototype链关联的对象上进行查找，以此类推。这就是原型链。**
### 创建关联
Object.create会创建一个拥有空原型链的对象，这个对象无法进行委托。由于这个对象没有原型链，所以instanceof操作符无法进行判断，因此总是返回false。这些特殊的空prototype对象通常被称为字典，它们完全不受原型链的干扰，因此很适合用来存储数据。

# 小结
如果要访问对象中不存在的一个属性，[[Get]]操作就会查找对象内部的[[prototype]]关联对象。这个关联关系实际上定义了一条原型链，在查找属性时会对它进行遍历。  
所有的普通对象都有内置的Object.prototype，指向原型链的顶端。  
使用new调用函数时会把新对象的prototype属性关联到其他对象。带new的函数调用通常被称为‘构造函数调用’，尽管和传统面向类语言的类构造函数不一样。  
虽然这些JavaScript中的机制和传统面向类语言中的‘类初始化’和‘类继承’很相似，但是JavaScript中的机制有一个核心区别，那就是不会进行复制，对象之间是通过内部的原型链关联的。  

# 如果js是第一门接触的语言，没有接触过其他的面向类的编程语言的话上面的讲的这种理解方式可能就不适用了。下面的这种可能更容易理解一些。
## js的面向对象
- **封装：将现实中一个事物的属性和功能集中定义在一个对象中。**
  - 如何封装？
    - 创建一个对象
      - 直接量
      - 使用new Object()
    - 如果需要反复创建多个结构相同的对象
      - 定义构造函数
      - 将公用的属性和方法使用this.的形式绑定
      - 然后使用new关键字调用初始化行的对象
        - new的时候回创建一个新的对象
        - 设置新对象的__proto__继承构造函数的原型对象（prototype）
        - 用当前新对象调用构造函数，向对象中添加属性和方法
        - 将新对象地址返回
  - **继承**
    - js中的继承都是通过原型实现的（prototype）
    - 在定义构造函数的时候，js会自动创建对应的原型对象（prototype）
    - 共有成员都在原型对象里面
  - **多态**
    - 同一个函数在不同情况下表现出不同的状态
    - 就是可以重写的意思，在子对象中，觉得父对象的方法不满足需求，就可以再子对象本地重新定义同名成员
    - 重写也可以调用父对象的原方法
      - es6之前可以使用this的显示绑定
      - es6之后新增了super关键字

## __proto__和constructor属性是对象所独有的，prototype属性是函数所独有的。（函数本身也是对象）
- prototyp只是一个属性，默认指向了原型对象，言外之意他是可以修改的！！！
- 同样的prototype的.constructor属性只是函数在声明时的默认属性，如果prototyp被修改了，那么constructor就没了，不会自动帮我们关联到新的绑定的对象上，新的对象有自己的constructor。此时一般我们需要手动修复这个问题。
- __proto__这个属性不在标准里面(es6之前)，不是所有的JS引擎都支持它，它作为Object.prototype上的一个存取器属性主要用来获取或者设置某个对象的[[prototype]]（可以直接使用__proto__赋值）
  - 如果要设置可以使用Object.setPrototypeOf(操作的目标，要继承的目标)
  - 在就是上面说的prototype可以直接修改的``构造函数.prototype=source``
    - 这样修改之后，后面new的对象都会改变
  

# 行为委托
## 类理论
许多行为可以先抽象到父类然后在用子类进行特殊化（重写）。
## 委托理论
JavaScript中原型链机制会把对象关联到其他对象。委托的行为以为着某些对象在找不到属性或者方法引用时会把这个请求委托给另一个对象。
### 相互委托（禁止）

**行为委托认为对象之间是兄弟关系，互相委托，而不是父类和子类的关系。JavaScript的原型机制本质上就是行为委托机制。也就是说，我们可以选择在JavaScript中努力实现累计值，也可以拥抱更自然的原型委托机制。**

