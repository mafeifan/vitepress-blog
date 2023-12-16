##  VBoxManage list vms

"<inaccessible>" {eabd0460-d91f-412e-bae8-f005bdcbf425}
"master" {d71f98cd-2226-4245-932a-6d51203c1ca3}
"vm2" {fa92ff63-17ea-4f2c-bbaa-16ed25d56a02}

## VBoxManage list -l runningvms

Name:                        master
Groups:                      /k8s
Guest OS:                    Ubuntu (64-bit)
UUID:                        d71f98cd-2226-4245-932a-6d51203c1ca3
Config file:                 /Users/mafei/VirtualBox VMs/k8s/master/master.vbox
Snapshot folder:             /Users/mafei/VirtualBox VMs/k8s/master/Snapshots
Log folder:                  /Users/mafei/VirtualBox VMs/k8s/master/Logs
Hardware UUID:               d71f98cd-2226-4245-932a-6d51203c1ca3
Memory size:                 8024MB
Page Fusion:                 disabled
VRAM size:                   16MB
CPU exec cap:                100%
HPET:                        disabled
CPUProfile:                  host
Chipset:                     piix3
Firmware:                    BIOS
Number of CPUs:              2
PAE:                         disabled
Long Mode:                   enabled
Triple Fault Reset:          disabled
APIC:                        enabled
X2APIC:                      enabled
Nested VT-x/AMD-V:           disabled
CPUID Portability Level:     0
CPUID overrides:             None
Boot menu mode:              message and menu
Boot Device 1:               Floppy
Boot Device 2:               DVD
Boot Device 3:               HardDisk
Boot Device 4:               Not Assigned
ACPI:                        enabled
IOAPIC:                      enabled
BIOS APIC mode:              APIC
Time offset:                 0ms
RTC:                         UTC
Hardware Virtualization:     enabled
Nested Paging:               enabled
Large Pages:                 enabled
VT-x VPID:                   enabled
VT-x Unrestricted Exec.:     enabled
Paravirt. Provider:          Default
Effective Paravirt. Prov.:   KVM
State:                       running (since 2022-02-28T05:44:03.750000000)
Graphics Controller:         VMSVGA
Monitor count:               1
3D Acceleration:             disabled
2D Video Acceleration:       disabled
Teleporter Enabled:          disabled
Teleporter Port:             0
Teleporter Address:
Teleporter Password:
Tracing Enabled:             disabled
Allow Tracing to Access VM:  disabled
Tracing Configuration:
Autostart Enabled:           disabled
Autostart Delay:             0
Default Frontend:
VM process priority:         default
Storage Controller Name (0):            IDE
Storage Controller Type (0):            PIIX4
Storage Controller Instance Number (0): 0
Storage Controller Max Port Count (0):  2
Storage Controller Port Count (0):      2
Storage Controller Bootable (0):        on
Storage Controller Name (1):            SATA
Storage Controller Type (1):            IntelAhci
Storage Controller Instance Number (1): 0
Storage Controller Max Port Count (1):  30
Storage Controller Port Count (1):      1
Storage Controller Bootable (1):        on
IDE (1, 0): Empty
SATA (0, 0): /Users/mafei/VirtualBox VMs/k8s/master/master-disk001.vdi (UUID: 7118e955-753f-443c-9a82-c69bb318ea70)
NIC 1:                       MAC: 0800273DCB5C, Attachment: NAT Network 'NatNetwork', Cable connected: on, Trace: off (file: none), Type: virtio, Reported speed: 0 Mbps, Boot priority: 0, Promisc Policy: allow-all, Bandwidth group: none
NIC 2:                       disabled
NIC 3:                       disabled
NIC 4:                       disabled
NIC 5:                       disabled
NIC 6:                       disabled
NIC 7:                       disabled
NIC 8:                       disabled
Pointing Device:             USB Tablet
Keyboard Device:             PS/2 Keyboard
UART 1:                      disabled
UART 2:                      disabled
UART 3:                      disabled
UART 4:                      disabled
LPT 1:                       disabled
LPT 2:                       disabled
Audio:                       disabled
Audio playback:              enabled
Audio capture:               disabled
Clipboard Mode:              Bidirectional
Drag and drop Mode:          Bidirectional
Session name:                GUI/Qt
VRDE:                        disabled
OHCI USB:                    enabled
EHCI USB:                    disabled
xHCI USB:                    disabled

USB Device Filters:

<none>

Bandwidth groups:  <none>

Shared folders:<none>

Capturing:                   not active
Capture audio:               not active
Capture screens:             0
Capture file:                /Users/mafei/VirtualBox VMs/k8s/master/master.webm
Capture dimensions:          1024x768
Capture rate:                512kbps
Capture FPS:                 25kbps
Capture options:

Guest:

Configured memory balloon size: 0MB

## VBoxManage startvm master --type headless

Waiting for VM "master" to power on...
VM "master" has been successfully started.

## VBoxManage controlvm master poweroff