# class
类是一种可选的设计模式，在JavaScript中实现类很别扭。这种别扭不只是来源于语法，繁琐杂乱的prototype引用、试图调用原型链上层同名函数时的显式伪多态以及不可靠、不美观而且容易被误解成‘构造函数’的constructor。  
JavaScript中父类和子类之间不是复制的关系，只有引用（委托）。  

es6中class除了语法更好看之外
- 不再引用杂乱的prototype了
- 不需要手动的使用Object.create来替换prototype对象，也不需要设置__proto__或者Object.setPrototypeOf
- 可以使用super来实现相对多态，这样任何方法都可以引用原型链上层的同名方法。
- 可以通过extends很自然的扩展对象（子）类型，甚至是内置对象（子）类型
- 这只是语法糖，本质不是复制还是引用！！！

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