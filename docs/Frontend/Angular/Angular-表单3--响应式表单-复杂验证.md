表单验证是前端开发中重要的并且常见的工作
比如下面的表单包含三个字段：
* 验证要求：
name： 必填
Category： 必填，只能输入大小写，字符长度3到10
Price：必填，只能输入不超过100的数字
* 显示要求：
错误在表单上放统一显示
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-7fe3ee295b67474f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们可以借助Angular的formControl来实现，这里我们基于FormControl创建一个子类ProductFormControl来提高可复用性

核心代码：
form.model.ts
该文件是表单模型文件，与业务无关。只包含一个收集表单错误信息的方法
```typescript
import { FormControl, FormGroup, Validators } from "@angular/forms";
// 自定义验证器
import { LimitValidator } from "./limit.formvalidator";

export class ProductFormControl extends FormControl {
    label: string;
    modelProperty: string;

    constructor(label:string, property:string, value: any, validator: any) {
        super(value, validator);
        this.label = label;
        this.modelProperty = property;
    }
    // 此方法用于收集错误信息，然后在模板中遍历输出，
    getValidationMessages() {
        let messages: string[] = [];
        if (this.errors) {
            for (let errorName in this.errors) {
                switch (errorName) {
                    case "required":
                        messages.push(`You must enter a ${this.label}`);
                        break;
                    case "minlength":
                        messages.push(`A ${this.label} must be at least
                            ${this.errors['minlength'].requiredLength}
                            characters`);
                        break;
                    case "maxlength":
                        messages.push(`A ${this.label} must be no more than
                            ${this.errors['maxlength'].requiredLength}
                            characters`);
                        break;
                    case "limit":
                        messages.push(`A ${this.label} cannot be more
                                than ${this.errors['limit'].limit}`);
                        break;
                    case "pattern":
                        messages.push(`The ${this.label} contains
                             illegal characters`);
                        break;
                }
            }
        }
        return messages;
    }
}

// 业务相关，专门验证 Product Form
// 注意 new ProductFormControl() 不是 new FormControl()
export class ProductFormGroup extends FormGroup {

    constructor() {
        super({
            name: new ProductFormControl("Name", "name", "", Validators.required),
            category: new ProductFormControl("Category", "category", "",
                Validators.compose([Validators.required,
                    Validators.pattern("^[A-Za-z ]+$"),
                    Validators.minLength(3),
                    Validators.maxLength(10)])),
            price: new ProductFormControl("Price", "price", "",
                Validators.compose([Validators.required,
                    LimitValidator.Limit(100),
                    Validators.pattern("^[0-9\.]+$")]))
        });
    }

    get productControls(): ProductFormControl[] {
        return Object.keys(this.controls)
            .map(k => this.controls[k] as ProductFormControl);
    }

    getFormValidationMessages(form: any) : string[] {
        let messages: string[] = [];
        this.productControls.forEach(c => c.getValidationMessages()
            .forEach(m => messages.push(m)));
        return messages;
    }
}

```

其中 limit.formvalidator.ts 封装了一个验证长度限制的自定义验证器
```typescript
import { FormControl } from "@angular/forms";

export class LimitValidator {

    static Limit(limit:number) {
        return (control:FormControl) : {[key: string]: any} => {
            let val = Number(control.value);
            if (val != NaN && val > limit) {
                return {"limit": {"limit": limit, "actualValue": val}};
            } else {
                return null;
            }
        }
    }
}

```

最后在用到的组件中，直接引入 form.model
```typescript
import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Product } from "./product.model";
import { ProductFormGroup } from "./form.model";

@Component({
    selector: "app",
    templateUrl: "template.html"
})
export class ProductComponent {
    form: ProductFormGroup = new ProductFormGroup();

    newProduct: Product = new Product();

    get jsonProduct() {
        return JSON.stringify(this.newProduct);
    }

    addProduct(p: Product) {
        console.log("New Product: " + this.jsonProduct);
    }

    formSubmitted: boolean = false;

    submitForm(form: NgForm) {
        this.formSubmitted = true;
        if (form.valid) {
            this.addProduct(this.newProduct);
            this.newProduct = new Product();
            form.reset();
            this.formSubmitted = false;
        }
    }
}

```

完整实例可以参见：
[https://stackblitz.com/edit/angular-advance-form-control](https://stackblitz.com/edit/angular-advance-form-control)
