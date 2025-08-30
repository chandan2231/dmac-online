interface IPushAt<T> {
  index: number;
  value: T;
}

class Node<T> {
  public data: T;
  public next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList<T> {
  public head: Node<T> | null;

  constructor() {
    this.head = null;
  }

  append(value: T) {
    const node = new Node(value);

    if (!this.head) {
      return (this.head = node);
    }

    let current = this.head;
    while (current.next !== null) {
      current = current.next;
    }
    current.next = node;
  }

  prepend(value: T) {
    const node = new Node(value);

    if (!this.head) {
      return (this.head = node);
    }

    node.next = this.head;
    this.head = node;
  }

  printList() {
    if (!this.head) {
      return console.log("EMPTY LIST");
    }

    let current = this.head;
    let ans = "";

    while (current) {
      ans += `${current.data} =>`;
      current = current.next as Node<T>;
    }

    console.log("LIST: ", ans);
    return ans;
  }

  size() {
    let size = 0;
    if (!this.head) {
      return size;
    }

    let current = this.head;
    while (current) {
      size = size + 1;
      current = current.next as Node<T>;
    }

    console.log("SIZE: ", size);
    return size;
  }

  clear() {
    return (this.head = null);
  }

  pushAt(index: IPushAt<T>["index"], value: IPushAt<T>["value"]) {
    const currentSize = this.size();
    if (index > currentSize) {
      return console.log("OVERFLOW");
    }

    if (!this.head || index === 0) {
      return console.log("NO PLACE TO INSET NODE");
    }

    let size = 0;
    let current = this.head;

    while (size !== index) {
      const nextIndex = size + 1;
      if (nextIndex === index) {
        const node = new Node(value);
        node.next = current.next;
        current.next = node;
      }
      current = current.next as Node<T>;
      size++;
    }
  }

  doesExist(value: T) {
    let current = this.head;
    while (current) {
      if (current.data === value) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  findIndexOf(value: T) {
    let current = this.head;
    let index = 0;
    while (current) {
      index += 1;
      if (current.data === value) {
        return index;
      }
      current = current.next;
    }
    return index;
  }

  find(value: T) {
    let current = this.head;
    while (current) {
      if (current.data === value) {
        return current.data;
      }
      current = current.next as Node<T>;
    }
  }

  filter(value: T) {
    let current = this.head;
    const filteredList = [];
    while (current) {
      if (current.data === value) {
        filteredList.push(current.data);
      }
      current = current.next;
    }
    return filteredList;
  }
}

const LLinkedList = new LinkedList();
LLinkedList.printList();
console.log(LLinkedList.append(1));
console.log(LLinkedList.printList());
console.log(LLinkedList.printList());
console.log(LLinkedList.size());
LLinkedList.pushAt(1, 2);
LLinkedList.pushAt(1, 3);
LLinkedList.pushAt(2, 4);
console.log(LLinkedList.doesExist(2));
console.log(LLinkedList.findIndexOf(2));
console.log(LLinkedList.find(2));
LLinkedList.append(2);
console.log(LLinkedList.filter(2));
console.log(LLinkedList.printList());
