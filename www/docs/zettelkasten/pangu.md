🗓️ 31012025 1810
📎

# pangu
Pangu is a high-reliability, high-availability, and high-performance distributed file system developed by Alibaba Cloud. It has a history of nearly ten years. As a unified storage core of Alibaba Cloud, Pangu 1.0 stably and efficiently supported the rapid development of multiple business lines of Alibaba Cloud, including [ECS](https://www.alibabacloud.com/product/ecs), [NAS](https://www.alibabacloud.com/product/nas), [OSS](https://www.alibabacloud.com/product/oss), [Table Store](https://www.alibabacloud.com/product/table-store), [MaxCompute](https://www.alibabacloud.com/product/maxcompute), and AnalyticDB. In recent years, Alibaba Cloud redesigned and implemented the second-generation storage engine Pangu 2.0. It provides better storage services not only for Alibaba Cloud but also for businesses of Alibaba Group and Ant Financial. There are two reasons for the upgrade: hardware improvements and demands from the business.

## Rapid Development of Underlying Hardware

In recent years, the performance of distributed storage-related hardware has dramatically improved.

The storage media has evolved from HDD to SATA SSD and NVMe SSD, and there is an improvement of two orders of magnitude in IOPS. Similarly, there is a reduction in latency by two orders of magnitude. The 4-KB sequential write performance has got reduced to 7 µs, and the Optane memory at the memory interface is about to enter the era of nanoseconds. Moreover, the network has rapidly developed from GE and 10GE to 25GE, 40GE, 50GE, or even 100GE. A hop takes as short as five µs.

The rapid development of the underlying hardware brings both opportunities and severe challenges to Pangu. To keep the leading capability in the industry, Pangu must make full use of the hardware.

## Pressure from the Upper-Layer Business

Currently, an increasing number of businesses are getting connected to Pangu. However, as enterprises have different requirements for storage, adequately supporting businesses has become an enormous pressure for Pangu.

Firstly, separation of storage and computing is Alibaba Cloud's strategy, which entails a storage cluster that provides the storage service for multiple computing clusters. It poses higher performance requirements for storage clusters. Serving the most computing clusters with the least storage clusters is the goal of Pangu in the future.

Secondly, after separation of storage and computing, it is expected that computing clusters use the same storage cluster namespace if possible so that the internal architecture and control of the storage cluster are transparent to users. In Pangu 1.0, data nodes have already supported auto-scaling. However, metadata nodes still rely on particular models with high configuration, which restricts the node size and number of files supported by a file system. Also, the centralized metadata servers become the most vulnerable component of the system. Faults of some metadata servers may cause the failure of the entire storage cluster.

Thirdly, different businesses require different types of access modes. Compatibility with sophisticated open interfaces is necessary for the expansion of the access range. The demand for supporting HDFS access rises, and many application vendors have posed for supporting POSIX access.

Finally, the market competition is increasingly fierce. As a unified storage platform of Alibaba Group, Pangu must use technologies to minimize the cost and win the initiative for the business.

To meet these absolute and high requirements, Pangu must set up new objectives in dimensions such as the architecture design and engineering practice to achieve breakthroughs.

## Design Objectives

To cope with the above-mentioned new trends and challenges, Pangu 2.0 has set up the following core design objectives:  

1. **Excellent Performance:** Performs architecture design and engineering optimization for the next-generation network and storage software and hardware and releases dividends for technical development of software and hardware; provides the ultra-high-performance distributed file system with high throughput and low latency.
2. **Fully Distributed Metadata Management:** Performs fully distributed management and dynamic splitting and migration of metadata to greatly increase the number of managed files, resolve the problem of special model dependence of metadata nodes, reduce the "explosion radius" of faults, and improve the platform stability.
3. **System Elasticity:** Supports multiple product forms and shares the core paths to provide the scalability for access of more businesses in the future and prevent architecture adjustment caused by business access; unifies the hardware access interfaces and supports access of current and future new hardware optimally.
4. **Optimized Cost:** Adopts the hierarchy, erasure coding (EC), compression, and deduplication technologies to reduce the storage cost, wins the initiative in increasingly fierce business competition, and gains technical advantages to cope with the exponential data growth.

## Pangu 2.0's Architecture

To achieve the preceding objectives, Pangu 2.0 adopts the hierarchical architecture, as shown in the following figure:

![1](https://yqintl.alicdn.com/b6a47ec1ddd1f41ff8c06825b0ef9e2130b10eb5.png "1")

The software and hardware integration layer are present at the bottom, which interacts with the hardware and independently completes fast import of new hardware and media. Based on the standard service provided by the software and hardware integration layer and the storage business logic, each storage server works as a standalone storage engine for data persistence. The upper layer, Pangu metadata layer, is responsible for the management of metadata, data placement, consistency, and reliability. Besides, the client, the metadata layer, and standalone storage engine cooperate with each other to complete more complex functions such as multi-copy protocol and EC.

Different businesses use Pangu for underlying storage. To adapt to various products and exploit its values to the maximum extent, Pangu provides multiple product adaptation layers based on different business features. For example, to better support the block storage related businesses, Pangu delivers the BlockFS access layer with its corresponding ESSD cloud disk product. This cloud disk provides the capability of 1,000,000 IOPS in the 4-KB extreme performance test and reaches the maximum bandwidth on both the two 25GE networks.

Pangu provides the LogFile adaption layer for services such as OSS, Table Store, and database that access Pangu using LogStream or in a similar way. It also provides the HDFS-compatible adaption layer to connect to the open source ecosystem and enable the Hadoop community to use Pangu seamlessly. The adaption layer bridges the product layer and Pangu core base layer, facilitating businesses to quickly and efficiently access Pangu and enjoy the high-performance and high-reliability distributed storage service provided by Pangu.

## Core Base

The core base layer of Pangu consists of the client, MetaServer, and ChunkServer.

![2](https://yqintl.alicdn.com/cba883be6e845c941eebcf961aa252f22ed1b2fe.png "2")

As shown in the above figure, MetaServer manages metadata such as the directory tree and data placement, ChunkServer reads, writes, and maintains data, and the client works with ChunkServer to complete data persistence by interacting with a small amount of MetaServer metadata. The overall architecture of Pangu is similar to that of HDFS. Therefore, Pangu is semantically compatible with HDFS to avoid problems that Amazon S3 and other object storage products encounter when adapting to HDFS, for example, the atomicity of the rename/delete operation.

Indeed, if Pangu is only a simple copy of HDFS, upper-layer businesses are not willing to access Pangu. Pangu attracts an increasing number of users by its advanced design and implementation in many aspects, with its brief description as follows:

### Fully Distributed Metadata Management

Pangu 2.0 adopts a fully distributed metadata management policy, in which MetaServer is horizontally expandable. Data partitioning is done based on the preset policy. Multiple MetaServers in each partition use the RAFT protocol to achieve high reliability and availability, and data in each MetaServer is persistent in ChunkServer in metachunk mode.

By using this scale-out design, the number of files in a cluster is not limited. Meanwhile, as the fault of MetaServer only affects some Meta partitions, the fault explosion radius is reduced, and the fault impact period gets decreased further after fast MetaServer migration.

### Efficient I/O Path

Fully distributed metadata management ensures higher stability and scalability of Pangu, and the efficient I/O path resolves the performance problem of Pangu.

Pangu uses the client-based coordinated I/O path after entirely comparing it with the Raft-based I/O path. The reason behind this is that the Raft method has intractable problems such as support for EC, service unavailability when most replicas fail, and RaftRing data explosion for large clusters. However, the client-based coordination method does not have such problems, and it simplifies the logic and improves the performance.

### Excellent Thread Model

The architecture of Pangu 2.0 has several advantages. For engineering implementation and better performance, the data path of Pangu uses the run-to-completion concurrency model. The entire I/O request gets processed in one thread, saving the overheads for thread synchronization, CPU cache miss, and context switch. To obtain the optimal performance using this concurrency model, Pangu well designs the underlying RDMA/TCP network library, SPDK I/O library, and modules at the business layer and connects all links.

### High-Performance Network Library

Pangu has minimized its performance overheads because the hardware performance must be flexible and efficiently exploited to create the optimal-performance storage system. In an environment with the high-speed network, Pangu supports RPC communications using RDMA, which is encapsulated in the RPC and transparent to upper-layer businesses. Pangu can also flexibly implement TCP and RDMA communications based on requirements of different businesses.

### Cost Control

The high-reliability and high-performance distributed file system ensure the position of Pangu in the industry, while effective cost control further brings the initiative to the business. Therefore, Pangu has made every effort to reduce the cost of using various policies.  

1. **Support for the Multi-Medium Large Storage Pool:** Pangu 2.0 supports large storage pools with heterogeneous media. It can use various media such as the SSD and HDD in a ChunkServer and store different files or different replicas of files in the specified media to meet requirements of metadata/data and frontend/backend data of businesses in the capacity, performance, cost, and other dimensions. Also, distribution and allocation of resources in a large storage pool to multiple businesses can improve the resource usage.
2. **EC:** The latest HDFS 3.0 supports EC, while Pangu 1.0 has supported backend EC and Pangu 2.0 has supported frontend EC. Compared with the multi-replica service, EC greatly reduces the I/O and network traffic. In some scenarios, EC also reduces the cost and increases the throughput.

## DFS

In Alibaba Cloud, many users buy ECS virtual machines to build a Hadoop ecosystem for big data analysis, in which HDFS is a necessary component. However, as a non-cloud storage system, HDFS also has various disadvantages, such as poor elasticity, high management cost, the poor performance of small files, and lack of enterprise-level disaster recovery. Moreover, cloud users require HDFS to interconnect with other cloud data.

As an enterprise-level storage product of Alibaba Cloud, Pangu has appropriately resolved the above problems. To facilitate access to applications in the open source ecosystem, Pangu has developed a high-performance cloud-based distributed file system (DFS) that is compatible with HDFS. It allows seamless access of massive data and interacts with other storage products of Alibaba Cloud. With the integrated design of software and hardware, Pangu provides extreme end-to-end performance and low cost. Meanwhile, Pangu uses its unique intelligent management and O&M capabilities to reduce the O&M cost of users and deliver excellent user experience.

The architecture of DFS is simple. Its bottom layer depends on the Pangu distributed file system. Users can use the custom DFS client to forward access requests from HDFS to the DFS server, which then translates the HDFS requests to Pangu requests. Compared with the Pangu native business, DFS only increases a layer of network consumption theoretically.

Currently, DFS has completed compatibility tests of multiple open source ecosystems, for example:  

1. Hadoop fs commands
2. MapReduce without YARN + DFS
3. MapReduce with YARN + DFS
4. Hive without YARN + DFS
5. Hive with YARN + DFS
6. Spark without YARN + DFS
7. Spark with YARN + DFS
8. TPC-DS test SparkSQL + DFS
9. TPC-DS test Impala + DFS

Backed by the underlying Pangu system, DFS provides the powerful auto-scaling capability. A storage cluster can have more than 10,000 servers, with the capacity of more than 1 EB and performance of five to seven times that of HDFS. Moreover, DFS ensures 99.95% availability and 99.999999999% reliability and provides users with higher security protection in line with the IEEE802.3az standard.

## Future Prospects

Although Pangu has reached the leading position in the industry, new technologies and requirements are emerging. If Pangu does not catch up with other competitors, it may be soon thrown out. Therefore, Pangu always keeps its eye on the evolution of the underlying depended hardware and upper-layer business features. For example, Pangu is trying to replace the device-based SSD with the host-based SSD to better utilize the hardware performance by integrating the software and hardware. Also, it is developing the full-link QoS function to resolve the problem of resource competition between multiple users or tasks in scenarios where storage and computing services are separated.

---

# References
- https://www.alibabacloud.com/blog/pangu-the-high-performance-distributed-file-system-by-alibaba-cloud_594059