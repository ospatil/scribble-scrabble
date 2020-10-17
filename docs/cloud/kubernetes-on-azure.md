---
tags: ["kubernetes", "azure"]
---

# Creating a two node Kubernetes cluster on Azure using Kubeadm

<TagLinks />

Quick notes on creating a two-node Kubernetes cluster on Azure.

## Creating VMs in Azure

* Use same *resource group* for all the operations below.
* Create a SSH key with `azureuser` as username. Download the generated `pem` file and keep it at known location, e.g. `~/.ssh/azureuser.pem`. Change the permissions - `chmod 400 azureuser.pem`. This file will be needed to login into VMs through bastion (using *SSH Private Key from Local File* option).
* Create a *virtual network* with required address range like `10.100.0.0/24 (10.100.0.0 - 10.100.0.255)`. [Subnet Calculator](https://mxtoolbox.com/SubnetCalculator.aspx) is a handy tool to calculate CIDR IP range.
* Adjust the `default` subnet IP range under the above virtual network to something like `10.100.0.0/25 (10.100.0.0 - 10.100.0.127)`.
* Create a new subnet with name `AzureBastionSubnet` for bastion with CIDR `10.100.0.128/27 (10.100.0.128 - 10.100.0.159)`. The name has to be exactly as mentioned since that's what Azure Bastion requires.
* Create a *Network Security Group* and associate it with `default` subnet. The out-of-the-box inbound and outbound rules are good enough.
* Create a *Bastion*. Use `AzureBastionSubnet` as a subnet. Select option to create new IP address. The VMs won't be exposed to internet and we'll connect to them only through bastion.
* Create two virtual machines - one for Kubernetes master node and other for a worker node.
  * Use latest *Ubuntu Server LTS* image.
  * *B2ms* size with 2 vCPUs, 8 GiB RAM and about 30 GiB disks is a good choice.
  * Use `SSH public key` authentication with `azureuser` as username and use the SSH key created earlier as `Use existing key stored in Azure` option value.
  * Select `None` for *Public inbound ports*.
  * Use the *virtual network* and `default` subnet created earlier in the networking options. Set *Public IP* to `None`. Select `None` for *NIC network security group*.
* Start the VMs and connect to them using *SSH Private Key from Local File* option and `pem` file created earlier.

## Setting up Kubernetes cluster

* Run the following commands on both VMs:

  ```bash
  # kubeadm needs swapoff. Turn it off till next reboot. On Azure it's off by default.
  sudo swapoff -a
  sudo apt-get update && sudo apt-get upgrade -y
  # install docker
  sudo apt-get install -y docker.io
  # add Kubernetes to the package manager’s list of resources
  sudo sh -c "echo 'deb http://apt.kubernetes.io/ kubernetes-xenial main' >> /etc/apt/sources.list.d/kubernetes.list"
  # add the required GPG key to apt-sources to authenticate the Kubernetes related packages
  sudo sh -c "curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -"
  sudo apt-get update
  # install kubeadm, kubelet, and kubectl
  sudo apt-get install -y kubeadm=1.19.0-00 kubelet=1.19.0-00 kubectl=1.19.0-00
  # hold the installed packages at their installed versions
  sudo apt-mark hold kubelet kubeadm kubectl
  ```

* On master node VM, run the following commands to setup a master node:

  ```bash
  # the pod-network-cidr is for Calico netwrking plugin
  sudo kubeadm init --kubernetes-version 1.19.0 --pod-network-cidr 192.168.0.0/16
  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
  # Apply Calico networking plugin
  kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
  # check the master node is running
  azureuser@master:~$ kubectl get node
  NAME        STATUS     ROLES    AGE    VERSION
  master      Ready      master   4m     v1.19.0
  ```

* On the worker node VM, run the following commands:

  ```bash
  # Run the join command you get in the output of kubeadm init command on master
  sudo kubeadm join --token 118c3e.83b49999dc5dc034 10.100.0.4:6443 --discovery-token-ca-cert-hash sha256:40aa946e3f53e38271bae24723866f56c86d77efb49aedeb8a70cc189bfe2e1d
  ```

* If we forget to save the join command, it can be generated again on **master node** using command: `kubeadm token create --print-join-command`.

* Verify the worker has joined the cluster by running the following command on **master node**:

  ```bash
  azureuser@master:~$ kubectl get node
  NAME      STATUS   ROLES    AGE    VERSION
  master    Ready    master   27m    v1.19.0
  worker    Ready    <none>   10m    v1.19.0
  ```

* Master node doesn't allow deployment of general containers due to security reasons. This is achieved through taints. With only two nodes in our cluster, let's remove the taint to allow deployments on both nodes. *Do not do this in production*.

  ```bash
  # see the taints
  azureuser@master:~$ kubectl describe nodes | grep -i Taint
  Taints:             node-role.kubernetes.io/master:NoSchedule
  Taints:             <none>
  # remove the taint on master, the negative sign at the end removes the taint
  kubectl taint nodes --all node-role.kubernetes.io/master-
  azureuser@master:~$ kubectl describe nodes | grep -i Taint
  Taints:             <none>
  Taints:             <none>
  ```

* To stop the cluster, stop the worker node first followed by master node and other way round while starting up.
