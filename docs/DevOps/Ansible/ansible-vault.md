#### ansible-vault
可以加密解密 yaml 文件，加密时提供口令，解密时提供口令

```bash
ansible-vault -h
usage: ansible-vault [-h] [--version] [-v] {create,decrypt,edit,view,encrypt,encrypt_string,rekey} ...

encryption/decryption utility for Ansible data files

positional arguments:
  {create,decrypt,edit,view,encrypt,encrypt_string,rekey}
    create              Create new vault encrypted file
    decrypt             Decrypt vault encrypted file
    edit                Edit vault encrypted file
    view                View vault encrypted file
    encrypt             Encrypt YAML file
    encrypt_string      Encrypt a string
    rekey               Re-key a vault encrypted file
    
# 加密文件，记住口令
ansible-vault encrypt  hello.yaml 
New Vault password: 
Confirm New Vault password: 
Encryption successful
```
