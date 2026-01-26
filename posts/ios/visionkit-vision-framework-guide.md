---
title: iOS VisionKit 与 Vision Framework 完全指南：从文档扫描到 AI 视觉识别
date: 2026-01-10 14:20:00
description: 全面深入讲解 iOS VisionKit 和 Vision Framework 的使用方法，包括文档扫描、OCR 文字识别、物体检测、人脸识别、图像分类等功能，配有完整的 SwiftUI 实战案例和性能优化建议。
keywords:
  - iOS
  - VisionKit
  - Vision Framework
  - OCR
  - 图像识别
  - SwiftUI
categories:
  - iOS 开发
tags:
  - iOS
  - VisionKit
  - Vision Framework
  - 图像识别
  - OCR
  - SwiftUI
cover: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920
---

# iOS VisionKit 与 Vision Framework 完全指南

在 iOS 开发中，Apple 提供了强大的视觉识别能力。本文将深入介绍 **VisionKit** 和 **Vision Framework** 这两个框架，帮助你理解它们的区别、使用场景，并通过实战代码掌握从文档扫描到 AI 物体识别的完整实现。

## iOS 系统版本占有率分析（2026 年初）

### 当前市场占有率分布

根据最新数据（2025年底-2026年初）：

| iOS 版本 | 市场占有率 | 发布时间 | 状态 |
|---------|-----------|---------|------|
| **iOS 18.x** | ~39.57% | 2024年9月 | 主流版本 |
| **iOS 17.x** | ~25% | 2023年9月 | 较高占有率 |
| **iOS 16.x** | ~15% | 2022年9月 | 中等占有率 |
| **iOS 15.x** | ~10% | 2021年9月 | 逐渐减少 |
| **iOS 14及以下** | ~10% | 2020年及之前 | 少量用户 |

### 关键洞察

- **iOS 18+ 累计占有率约 40%**
- **iOS 16+ 累计占有率约 80%**（VisionKit 实时扫描功能可用）
- **iOS 13+ 累计占有率约 95%**（VisionKit 基础功能可用）
- **iOS 11+ 几乎 100%**（Vision Framework 可用）

### 开发策略建议

| 应用类型 | 推荐最低版本 | 原因 | 覆盖率 |
|---------|------------|------|--------|
| **新应用/初创** | iOS 16+ | 最佳体验，减少技术债务 | 80% |
| **主流消费应用** | iOS 13+ | 平衡体验与覆盖率 | 95% |
| **企业应用** | iOS 11+ | 最大兼容性 | 100% |
| **工具类应用** | iOS 13+ | 需要 VisionKit UI | 95% |
| **AI 创新应用** | iOS 17+ | 需要最新特性 | 65% |

## VisionKit & Vision Framework 各版本功能对比

### 功能可用性矩阵

| 功能特性 | iOS 11 | iOS 12 | iOS 13 | iOS 14-15 | iOS 16+ | iOS 17+ | 覆盖率 |
|---------|--------|--------|--------|-----------|---------|---------|--------|
| **Vision Framework** |
| 文本识别 (OCR) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~100% |
| 人脸检测 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~100% |
| 条形码识别 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~100% |
| 物体分类 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~100% |
| 图像追踪 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~100% |
| 显著性检测 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ~95% |
| **VisionKit** |
| 文档扫描 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ~95% |
| 实时数据扫描 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ~80% |
| Live Text | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ~80% |
| 主体抠图 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ~65% |

### 详细功能说明

#### iOS 11-12 (Vision Framework Only)

**可用功能：**
- `VNRecognizeTextRequest` - 文本识别
- `VNDetectFaceRectanglesRequest` - 人脸检测
- `VNDetectBarcodesRequest` - 条形码识别
- `VNClassifyImageRequest` - 图像分类
- `VNTrackObjectRequest` - 物体追踪

**不可用：**
- 所有 VisionKit UI 组件
- 文档扫描器

#### iOS 13-15 (VisionKit 基础版)

**新增功能：**
- `VNDocumentCameraViewController` - 文档扫描
- 改进的文本识别准确度
- 显著性分析 (iOS 13+)

**不可用：**
- `DataScannerViewController`
- Live Text 交互
- `ImageAnalysisInteraction`

#### iOS 16+ (VisionKit 完整版)

**新增功能：**
- `DataScannerViewController` - 实时扫描
- `ImageAnalysisInteraction` - Live Text
- `ImageAnalyzer` - 图像分析
- 实时文本识别
- 实时条形码扫描

**覆盖约 80% 的活跃用户**

#### iOS 17+ (最新特性)

**新增功能：**
- 主体抠图 (Subject Lifting)
- `interaction.subject` - 提取图像主体
- 改进的识别性能
- 更快的处理速度

**覆盖约 65% 的活跃用户**

### 版本兼容性检查最佳实践

```swift
import VisionKit

struct FeatureAvailability {

    // 检查是否支持实时数据扫描
    static var supportsLiveDataScanning: Bool {
        if #available(iOS 16.0, *) {
            return DataScannerViewController.isSupported &&
                   DataScannerViewController.isAvailable
        }
        return false
    }

    // 检查是否支持文档扫描
    static var supportsDocumentScanning: Bool {
        if #available(iOS 13.0, *) {
            return VNDocumentCameraViewController.isSupported
        }
        return false
    }

    // 检查是否支持 Live Text
    static var supportsLiveText: Bool {
        if #available(iOS 16.0, *) {
            return true
        }
        return false
    }

    // 检查是否支持主体抠图
    static var supportsSubjectLifting: Bool {
        if #available(iOS 17.0, *) {
            return true
        }
        return false
    }
}

// 使用示例
class OCRManager {

    func performOCR(completion: @escaping (String?) -> Void) {
        if FeatureAvailability.supportsLiveDataScanning {
            // 方案 A: 使用实时扫描 (iOS 16+, 覆盖 80%)
            useLiveDataScanner(completion: completion)
        } else if FeatureAvailability.supportsDocumentScanning {
            // 方案 B: 使用文档扫描 (iOS 13+, 覆盖 95%)
            useDocumentScanner(completion: completion)
        } else {
            // 方案 C: 使用纯 Vision Framework (iOS 11+, 覆盖 100%)
            useVisionFramework(completion: completion)
        }
    }

    @available(iOS 16.0, *)
    private func useLiveDataScanner(completion: @escaping (String?) -> Void) {
        print("✨ 使用 iOS 16+ DataScannerViewController")
        // 实现实时扫描逻辑
    }

    @available(iOS 13.0, *)
    private func useDocumentScanner(completion: @escaping (String?) -> Void) {
        print("📄 使用 iOS 13+ VNDocumentCameraViewController")
        // 实现文档扫描逻辑
    }

    private func useVisionFramework(completion: @escaping (String?) -> Void) {
        print("🔍 使用 iOS 11+ Vision Framework")
        // 实现基础 OCR 逻辑
    }
}
```

## 框架概述

### Vision Framework

**Vision Framework** 是 Apple 在 iOS 11 引入的底层计算机视觉框架，提供强大的图像分析能力。

**核心特性：**
- 🔍 图像分析和处理
- 📝 文本检测和识别（OCR）
- 👤 人脸检测和特征点识别
- 🐕 物体检测和分类
- 📊 条形码识别
- 🎯 图像对齐和追踪
- 🖼️ 显著性分析
- 🤖 支持 Core ML 模型

**适用场景：**
- 需要精细控制识别流程
- 批量图像处理
- 自定义识别模型
- 高级图像分析

### VisionKit

**VisionKit** 是 iOS 13 引入的高层框架，提供现成的 UI 组件和用户交互。

**核心特性：**
- 📄 文档扫描（自动边缘检测、透视校正）
- 📱 实时文本识别（iOS 16+）
- 🔍 条形码/二维码扫描（iOS 16+）
- 🖼️ Live Text（图像文本交互）
- ✂️ 主体抠图（iOS 17+）

**适用场景：**
- 快速实现标准功能
- 需要系统级 UI 体验
- 文档扫描
- 实时相机识别

### 两者关系

```
┌─────────────────────────────────────────┐
│          你的应用代码                      │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼──────────┐  ┌─────▼──────────────┐
│  VisionKit   │  │  Vision Framework  │
│ (高层 UI)     │  │  (底层算法)         │
└───┬──────────┘  └─────┬──────────────┘
    │                   │
    └─────────┬─────────┘
              │
    ┌─────────▼──────────┐
    │  Core ML / Core Image│
    │  (机器学习/图像处理)   │
    └────────────────────┘
```

**关系说明：**
- VisionKit 内部使用 Vision Framework
- Vision Framework 可以独立使用
- 两者可以配合使用，发挥各自优势

## Vision Framework 详解

### 基础架构

Vision Framework 采用请求-处理器模式：

```swift
// 1. 创建请求（Request）
let request = VNRecognizeTextRequest { request, error in
    // 处理结果
}

// 2. 创建请求处理器（Request Handler）
let handler = VNImageRequestHandler(cgImage: cgImage)

// 3. 执行请求
try? handler.perform([request])
```

### 1. 文本识别（OCR）

#### 基础文本识别

```swift
import Vision
import UIKit

class TextRecognitionManager {

    // 识别图片中的文字
    func recognizeText(in image: UIImage, completion: @escaping (String?) -> Void) {
        guard let cgImage = image.cgImage else {
            completion(nil)
            return
        }

        // 创建文本识别请求
        let request = VNRecognizeTextRequest { request, error in
            guard let observations = request.results as? [VNRecognizedTextObservation],
                  error == nil else {
                completion(nil)
                return
            }

            // 提取所有文本
            let recognizedText = observations.compactMap { observation in
                observation.topCandidates(1).first?.string
            }.joined(separator: "\n")

            completion(recognizedText)
        }

        // 配置识别参数
        request.recognitionLevel = .accurate  // 或 .fast
        request.recognitionLanguages = ["zh-Hans", "en-US"]  // 支持中英文
        request.usesLanguageCorrection = true  // 启用语言校正

        // 创建请求处理器并执行
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try handler.perform([request])
            } catch {
                print("文本识别失败: \(error)")
                completion(nil)
            }
        }
    }

    // 获取文本的详细信息（包含位置）
    func recognizeTextWithBounds(in image: UIImage, completion: @escaping ([TextResult]) -> Void) {
        guard let cgImage = image.cgImage else {
            completion([])
            return
        }

        let request = VNRecognizeTextRequest { request, error in
            guard let observations = request.results as? [VNRecognizedTextObservation],
                  error == nil else {
                completion([])
                return
            }

            let results = observations.compactMap { observation -> TextResult? in
                guard let candidate = observation.topCandidates(1).first else {
                    return nil
                }

                return TextResult(
                    text: candidate.string,
                    confidence: candidate.confidence,
                    boundingBox: observation.boundingBox
                )
            }

            completion(results)
        }

        request.recognitionLevel = .accurate

        let handler = VNImageRequestHandler(cgImage: cgImage)

        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request])
        }
    }
}

// 文本识别结果
struct TextResult {
    let text: String
    let confidence: Float  // 置信度 0-1
    let boundingBox: CGRect  // 文本在图片中的位置（归一化坐标）
}

// 使用示例
let manager = TextRecognitionManager()

manager.recognizeText(in: image) { text in
    if let text = text {
        print("识别到的文字：\n\(text)")
    }
}
```

#### 实时文本识别（相机）

```swift
import AVFoundation
import Vision

class LiveTextRecognitionViewController: UIViewController {

    private var captureSession: AVCaptureSession!
    private var previewLayer: AVCaptureVideoPreviewLayer!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupCamera()
    }

    private func setupCamera() {
        captureSession = AVCaptureSession()
        captureSession.sessionPreset = .high

        // 配置摄像头输入
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: camera) else {
            return
        }

        captureSession.addInput(input)

        // 配置视频输出
        let videoOutput = AVCaptureVideoDataOutput()
        videoOutput.setSampleBufferDelegate(self, queue: DispatchQueue(label: "videoQueue"))
        captureSession.addOutput(videoOutput)

        // 添加预览层
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.videoGravity = .resizeAspectFill
        previewLayer.frame = view.bounds
        view.layer.addSublayer(previewLayer)

        // 启动会话
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
        }
    }
}

extension LiveTextRecognitionViewController: AVCaptureVideoDataOutputSampleBufferDelegate {

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {

        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
            return
        }

        // 创建文本识别请求
        let request = VNRecognizeTextRequest { request, error in
            guard let observations = request.results as? [VNRecognizedTextObservation] else {
                return
            }

            let recognizedText = observations.compactMap {
                $0.topCandidates(1).first?.string
            }

            DispatchQueue.main.async {
                // 更新 UI 显示识别结果
                self.displayRecognizedText(recognizedText)
            }
        }

        request.recognitionLevel = .fast  // 实时识别使用快速模式

        // 创建请求处理器
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])

        do {
            try handler.perform([request])
        } catch {
            print("识别失败: \(error)")
        }
    }

    private func displayRecognizedText(_ texts: [String]) {
        // 显示识别结果
        print("实时识别: \(texts.joined(separator: ", "))")
    }
}
```

### 2. 人脸检测和识别

```swift
import Vision

class FaceDetectionManager {

    // 检测人脸
    func detectFaces(in image: UIImage, completion: @escaping ([FaceResult]) -> Void) {
        guard let cgImage = image.cgImage else {
            completion([])
            return
        }

        // 创建人脸检测请求
        let request = VNDetectFaceRectanglesRequest { request, error in
            guard let observations = request.results as? [VNFaceObservation],
                  error == nil else {
                completion([])
                return
            }

            let faces = observations.map { observation in
                FaceResult(
                    boundingBox: observation.boundingBox,
                    confidence: observation.confidence,
                    roll: observation.roll,
                    yaw: observation.yaw
                )
            }

            completion(faces)
        }

        let handler = VNImageRequestHandler(cgImage: cgImage)

        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request])
        }
    }

    // 检测人脸特征点（眼睛、鼻子、嘴巴等）
    func detectFaceLandmarks(in image: UIImage, completion: @escaping ([FaceLandmarksResult]) -> Void) {
        guard let cgImage = image.cgImage else {
            completion([])
            return
        }

        let request = VNDetectFaceLandmarksRequest { request, error in
            guard let observations = request.results as? [VNFaceObservation],
                  error == nil else {
                completion([])
                return
            }

            let results = observations.compactMap { observation -> FaceLandmarksResult? in
                guard let landmarks = observation.landmarks else {
                    return nil
                }

                return FaceLandmarksResult(
                    boundingBox: observation.boundingBox,
                    leftEye: landmarks.leftEye?.normalizedPoints ?? [],
                    rightEye: landmarks.rightEye?.normalizedPoints ?? [],
                    nose: landmarks.nose?.normalizedPoints ?? [],
                    outerLips: landmarks.outerLips?.normalizedPoints ?? [],
                    innerLips: landmarks.innerLips?.normalizedPoints ?? []
                )
            }

            completion(results)
        }

        let handler = VNImageRequestHandler(cgImage: cgImage)

        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request])
        }
    }
}

struct FaceResult {
    let boundingBox: CGRect
    let confidence: Float
    let roll: NSNumber?  // 侧倾角度
    let yaw: NSNumber?   // 偏航角度
}

struct FaceLandmarksResult {
    let boundingBox: CGRect
    let leftEye: [CGPoint]
    let rightEye: [CGPoint]
    let nose: [CGPoint]
    let outerLips: [CGPoint]
    let innerLips: [CGPoint]
}
```

### 3. 物体检测和分类

```swift
import Vision
import CoreML

class ObjectDetectionManager {

    // 使用内置分类器识别物体
    func classifyObject(in image: UIImage, completion: @escaping ([ClassificationResult]) -> Void) {
        guard let cgImage = image.cgImage else {
            completion([])
            return
        }

        // 创建图像分类请求
        let request = VNClassifyImageRequest { request, error in
            guard let observations = request.results as? [VNClassificationObservation],
                  error == nil else {
                completion([])
                return
            }

            // 筛选置信度高于 0.5 的结果
            let results = observations
                .filter { $0.confidence > 0.5 }
                .map { observation in
                    ClassificationResult(
                        identifier: observation.identifier,
                        confidence: observation.confidence
                    )
                }

            completion(results)
        }

        let handler = VNImageRequestHandler(cgImage: cgImage)

        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request])
        }
    }

    // 使用自定义 Core ML 模型
    func detectObjectsWithCustomModel(in image: UIImage, modelURL: URL, completion: @escaping ([DetectionResult]) -> Void) {
        guard let cgImage = image.cgImage else {
            completion([])
            return
        }

        do {
            // 加载 Core ML 模型
            let model = try VNCoreMLModel(for: MLModel(contentsOf: modelURL))

            // 创建 Core ML 请求
            let request = VNCoreMLRequest(model: model) { request, error in
                guard let observations = request.results as? [VNRecognizedObjectObservation],
                      error == nil else {
                    completion([])
                    return
                }

                let results = observations.map { observation in
                    DetectionResult(
                        label: observation.labels.first?.identifier ?? "Unknown",
                        confidence: observation.confidence,
                        boundingBox: observation.boundingBox
                    )
                }

                completion(results)
            }

            request.imageCropAndScaleOption = .scaleFit

            let handler = VNImageRequestHandler(cgImage: cgImage)

            DispatchQueue.global(qos: .userInitiated).async {
                try? handler.perform([request])
            }

        } catch {
            print("加载模型失败: \(error)")
            completion([])
        }
    }

    // 检测显著性区域（图片中最重要的部分）
    func detectSaliency(in image: UIImage, completion: @escaping ([CGRect]) -> Void) {
        guard let cgImage = image.cgImage else {
            completion([])
            return
        }

        let request = VNGenerateAttentionBasedSaliencyImageRequest { request, error in
            guard let observation = request.results?.first as? VNSaliencyImageObservation,
                  error == nil else {
                completion([])
                return
            }

            // 获取显著性对象的边界框
            let salientObjects = observation.salientObjects?.map { $0.boundingBox } ?? []
            completion(salientObjects)
        }

        let handler = VNImageRequestHandler(cgImage: cgImage)

        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request])
        }
    }
}

struct ClassificationResult {
    let identifier: String  // 物体类别（如 "dog", "cat"）
    let confidence: Float   // 置信度
}

struct DetectionResult {
    let label: String
    let confidence: Float
    let boundingBox: CGRect
}
```

### 4. 条形码识别

```swift
import Vision

class BarcodeDetectionManager {

    func detectBarcodes(in image: UIImage, completion: @escaping ([BarcodeResult]) -> Void) {
        guard let cgImage = image.cgImage else {
            completion([])
            return
        }

        // 创建条形码检测请求
        let request = VNDetectBarcodesRequest { request, error in
            guard let observations = request.results as? [VNBarcodeObservation],
                  error == nil else {
                completion([])
                return
            }

            let results = observations.compactMap { observation -> BarcodeResult? in
                guard let payload = observation.payloadStringValue else {
                    return nil
                }

                return BarcodeResult(
                    payload: payload,
                    symbology: observation.symbology.rawValue,
                    boundingBox: observation.boundingBox,
                    confidence: observation.confidence
                )
            }

            completion(results)
        }

        // 指定要检测的条形码类型
        request.symbologies = [
            .qr,           // 二维码
            .ean13,        // EAN-13
            .code128,      // Code 128
            .aztec,        // Aztec
            .dataMatrix    // Data Matrix
        ]

        let handler = VNImageRequestHandler(cgImage: cgImage)

        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request])
        }
    }
}

struct BarcodeResult {
    let payload: String          // 条形码内容
    let symbology: String        // 条形码类型
    let boundingBox: CGRect      // 位置
    let confidence: Float        // 置信度
}
```

### 5. 图像对齐和追踪

```swift
import Vision

class ImageTrackingManager {

    private var lastObservation: VNDetectedObjectObservation?

    // 开始追踪指定区域
    func startTracking(object boundingBox: CGRect, in image: UIImage) {
        guard let cgImage = image.cgImage else { return }

        let request = VNDetectRectanglesRequest { request, error in
            guard let observation = request.results?.first as? VNDetectedObjectObservation else {
                return
            }

            self.lastObservation = observation
        }

        let handler = VNImageRequestHandler(cgImage: cgImage)
        try? handler.perform([request])
    }

    // 在新帧中追踪物体
    func trackObject(in image: UIImage, completion: @escaping (CGRect?) -> Void) {
        guard let cgImage = image.cgImage,
              let lastObservation = lastObservation else {
            completion(nil)
            return
        }

        let request = VNTrackObjectRequest(detectedObjectObservation: lastObservation) { request, error in
            guard let observation = request.results?.first as? VNDetectedObjectObservation,
                  error == nil else {
                completion(nil)
                return
            }

            self.lastObservation = observation
            completion(observation.boundingBox)
        }

        request.trackingLevel = .accurate

        let handler = VNSequenceRequestHandler()

        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request], on: cgImage)
        }
    }
}
```

## VisionKit 详解

### 1. 文档扫描（VNDocumentCameraViewController）

VisionKit 最经典的功能，提供完整的文档扫描体验。

```swift
import VisionKit
import SwiftUI

// UIKit 实现
class DocumentScannerViewController: UIViewController {

    func showDocumentScanner() {
        // 检查设备是否支持文档扫描
        guard VNDocumentCameraViewController.isSupported else {
            print("该设备不支持文档扫描")
            return
        }

        let scanner = VNDocumentCameraViewController()
        scanner.delegate = self
        present(scanner, animated: true)
    }
}

extension DocumentScannerViewController: VNDocumentCameraViewControllerDelegate {

    // 扫描完成
    func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
        controller.dismiss(animated: true)

        // 处理扫描结果
        print("扫描了 \(scan.pageCount) 页")

        // 获取每一页的图片
        for pageIndex in 0..<scan.pageCount {
            let image = scan.imageOfPage(at: pageIndex)
            // 保存或处理图片
            processScannedImage(image)
        }
    }

    // 取消扫描
    func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
        controller.dismiss(animated: true)
        print("用户取消了扫描")
    }

    // 扫描失败
    func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
        controller.dismiss(animated: true)
        print("扫描失败: \(error.localizedDescription)")
    }

    private func processScannedImage(_ image: UIImage) {
        // 可以使用 Vision Framework 进行 OCR
        let manager = TextRecognitionManager()
        manager.recognizeText(in: image) { text in
            if let text = text {
                print("识别到的文字：\n\(text)")
            }
        }
    }
}

// SwiftUI 封装
struct DocumentScannerView: UIViewControllerRepresentable {

    @Binding var scannedImages: [UIImage]
    @Environment(\.presentationMode) var presentationMode

    func makeUIViewController(context: Context) -> VNDocumentCameraViewController {
        let scanner = VNDocumentCameraViewController()
        scanner.delegate = context.coordinator
        return scanner
    }

    func updateUIViewController(_ uiViewController: VNDocumentCameraViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, VNDocumentCameraViewControllerDelegate {
        let parent: DocumentScannerView

        init(_ parent: DocumentScannerView) {
            self.parent = parent
        }

        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
            var images: [UIImage] = []

            for pageIndex in 0..<scan.pageCount {
                let image = scan.imageOfPage(at: pageIndex)
                images.append(image)
            }

            parent.scannedImages = images
            parent.presentationMode.wrappedValue.dismiss()
        }

        func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
            parent.presentationMode.wrappedValue.dismiss()
        }

        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
            print("扫描失败: \(error)")
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

// SwiftUI 使用示例
struct ContentView: View {
    @State private var scannedImages: [UIImage] = []
    @State private var showScanner = false

    var body: some View {
        VStack {
            Button("扫描文档") {
                showScanner = true
            }

            if !scannedImages.isEmpty {
                Text("已扫描 \(scannedImages.count) 页")

                ScrollView {
                    ForEach(scannedImages.indices, id: \.self) { index in
                        Image(uiImage: scannedImages[index])
                            .resizable()
                            .scaledToFit()
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
            }
        }
        .sheet(isPresented: $showScanner) {
            DocumentScannerView(scannedImages: $scannedImages)
        }
    }
}
```

### 2. 实时数据扫描（DataScannerViewController - iOS 16+）

DataScannerViewController 提供实时扫描文本和条形码的能力。

```swift
import VisionKit
import SwiftUI

@available(iOS 16.0, *)
class LiveDataScannerViewController: UIViewController {

    private var dataScannerVC: DataScannerViewController?

    override func viewDidLoad() {
        super.viewDidLoad()
        setupDataScanner()
    }

    private func setupDataScanner() {
        // 检查设备是否支持
        guard DataScannerViewController.isSupported,
              DataScannerViewController.isAvailable else {
            print("设备不支持实时数据扫描")
            return
        }

        // 配置要识别的数据类型
        let recognizedDataTypes: Set<DataScannerViewController.RecognizedDataType> = [
            .text(languages: ["zh-Hans", "en-US"]),  // 文本识别
            .barcode(symbologies: [.qr, .ean13])     // 条形码识别
        ]

        // 创建扫描器
        dataScannerVC = DataScannerViewController(
            recognizedDataTypes: recognizedDataTypes,
            qualityLevel: .balanced,              // accurate, balanced, fast
            recognizesMultipleItems: true,        // 是否识别多个项目
            isHighFrameRateTrackingEnabled: true, // 高帧率追踪
            isPinchToZoomEnabled: true,           // 捏合缩放
            isGuidanceEnabled: true,              // 显示引导
            isHighlightingEnabled: true           // 高亮识别结果
        )

        dataScannerVC?.delegate = self

        // 添加到视图层级
        if let scannerVC = dataScannerVC {
            addChild(scannerVC)
            view.addSubview(scannerVC.view)
            scannerVC.view.frame = view.bounds
            scannerVC.didMove(toParent: self)
        }
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)

        // 开始扫描
        try? dataScannerVC?.startScanning()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)

        // 停止扫描
        dataScannerVC?.stopScanning()
    }
}

@available(iOS 16.0, *)
extension LiveDataScannerViewController: DataScannerViewControllerDelegate {

    // 检测到新项目
    func dataScanner(_ dataScanner: DataScannerViewController, didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {

        for item in addedItems {
            switch item {
            case .text(let text):
                print("识别到文字: \(text.transcript)")
                handleRecognizedText(text)

            case .barcode(let barcode):
                print("识别到条形码: \(barcode.payloadStringValue ?? "无内容")")
                handleRecognizedBarcode(barcode)

            @unknown default:
                break
            }
        }
    }

    // 项目更新
    func dataScanner(_ dataScanner: DataScannerViewController, didUpdate updatedItems: [RecognizedItem], allItems: [RecognizedItem]) {
        // 处理更新的项目
    }

    // 项目移除
    func dataScanner(_ dataScanner: DataScannerViewController, didRemove removedItems: [RecognizedItem], allItems: [RecognizedItem]) {
        // 处理移除的项目
    }

    // 用户点击识别项
    func dataScanner(_ dataScanner: DataScannerViewController, didTapOn item: RecognizedItem) {
        switch item {
        case .text(let text):
            // 复制文字到剪贴板
            UIPasteboard.general.string = text.transcript
            print("已复制: \(text.transcript)")

        case .barcode(let barcode):
            // 处理条形码点击
            if let payload = barcode.payloadStringValue,
               let url = URL(string: payload) {
                UIApplication.shared.open(url)
            }

        @unknown default:
            break
        }
    }

    private func handleRecognizedText(_ text: RecognizedItem.Text) {
        // 处理识别到的文字
        let transcript = text.transcript
        let bounds = text.bounds

        print("文字: \(transcript)")
        print("位置: \(bounds)")
    }

    private func handleRecognizedBarcode(_ barcode: RecognizedItem.Barcode) {
        // 处理识别到的条形码
        if let payload = barcode.payloadStringValue {
            print("条形码内容: \(payload)")
            print("类型: \(barcode.observation.symbology.rawValue)")
        }
    }
}

// SwiftUI 封装
@available(iOS 16.0, *)
struct LiveDataScannerView: UIViewControllerRepresentable {

    @Binding var recognizedText: String
    @Binding var recognizedBarcode: String

    func makeUIViewController(context: Context) -> LiveDataScannerViewController {
        let vc = LiveDataScannerViewController()
        return vc
    }

    func updateUIViewController(_ uiViewController: LiveDataScannerViewController, context: Context) {}
}

// SwiftUI 使用示例
@available(iOS 16.0, *)
struct LiveScannerContentView: View {
    @State private var recognizedText = ""
    @State private var recognizedBarcode = ""
    @State private var showScanner = false

    var body: some View {
        VStack {
            Button("开始实时扫描") {
                showScanner = true
            }

            if !recognizedText.isEmpty {
                Text("识别文字: \(recognizedText)")
                    .padding()
            }

            if !recognizedBarcode.isEmpty {
                Text("条形码: \(recognizedBarcode)")
                    .padding()
            }
        }
        .fullScreenCover(isPresented: $showScanner) {
            LiveDataScannerView(
                recognizedText: $recognizedText,
                recognizedBarcode: $recognizedBarcode
            )
        }
    }
}
```

### 3. Live Text（ImageAnalysisInteraction - iOS 16+）

Live Text 允许用户直接与图片中的文字交互。

```swift
import VisionKit
import UIKit

@available(iOS 16.0, *)
class LiveTextImageViewController: UIViewController {

    private let imageView = UIImageView()
    private let analyzer = ImageAnalyzer()
    private let interaction = ImageAnalysisInteraction()

    override func viewDidLoad() {
        super.viewDidLoad()
        setupImageView()
        setupLiveText()
    }

    private func setupImageView() {
        imageView.contentMode = .scaleAspectFit
        imageView.isUserInteractionEnabled = true
        view.addSubview(imageView)

        // 设置约束
        imageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            imageView.topAnchor.constraint(equalTo: view.topAnchor),
            imageView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            imageView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            imageView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func setupLiveText() {
        // 添加交互
        imageView.addInteraction(interaction)

        // 配置
        interaction.allowLongPressForDataDetectorsInTextMode = true
        interaction.preferredInteractionTypes = [.automatic]  // .textSelection, .dataDetectors, .imageSubject
    }

    // 分析图片
    func analyzeImage(_ image: UIImage) async {
        imageView.image = image

        guard let cgImage = image.cgImage else { return }

        // 配置分析选项
        let configuration = ImageAnalyzer.Configuration([
            .text,           // 文字识别
            .machineReadableCode,  // 条形码
            .visualLookUp    // 视觉查找（识别物体）
        ])

        do {
            // 执行分析
            let analysis = try await analyzer.analyze(cgImage, configuration: configuration)

            // 设置分析结果
            interaction.analysis = analysis
            interaction.preferredInteractionTypes = .automatic

            // 检查分析结果
            if analysis.hasResults(for: .text) {
                print("✅ 图片包含文字")
            }

            if analysis.hasResults(for: .machineReadableCode) {
                print("✅ 图片包含条形码")
            }

            // 获取识别到的文字
            if let transcript = analysis.transcript {
                print("识别文字: \(transcript)")
            }

        } catch {
            print("分析失败: \(error)")
        }
    }

    // 提取图片主体（iOS 17+）
    @available(iOS 17.0, *)
    func extractSubject() async -> UIImage? {
        guard let analysis = interaction.analysis,
              analysis.hasResults(for: .visualLookUp) else {
            return nil
        }

        do {
            // 提取主体图像
            let subject = try await interaction.subject

            if let imageData = subject.data(as: .png) {
                return UIImage(data: imageData)
            }
        } catch {
            print("提取主体失败: \(error)")
        }

        return nil
    }
}

// SwiftUI 实现
@available(iOS 16.0, *)
struct LiveTextImageView: View {
    let image: UIImage
    @State private var analyzedImage: Image?
    @State private var overlayView = ImageAnalysisOverlayView()

    var body: some View {
        ZStack {
            if let analyzedImage = analyzedImage {
                analyzedImage
                    .resizable()
                    .scaledToFit()
            } else {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
            }
        }
        .overlay(
            ImageAnalysisOverlayViewWrapper(overlayView: overlayView)
        )
        .task {
            await analyzeImage()
        }
    }

    private func analyzeImage() async {
        let analyzer = ImageAnalyzer()
        let configuration = ImageAnalyzer.Configuration([.text, .machineReadableCode])

        guard let cgImage = image.cgImage else { return }

        do {
            let analysis = try await analyzer.analyze(cgImage, configuration: configuration)
            overlayView.analysis = analysis
            overlayView.preferredInteractionTypes = .automatic
        } catch {
            print("分析失败: \(error)")
        }
    }
}

// ImageAnalysisOverlayView 的 SwiftUI 包装器
@available(iOS 16.0, *)
struct ImageAnalysisOverlayViewWrapper: UIViewRepresentable {
    let overlayView: ImageAnalysisOverlayView

    func makeUIView(context: Context) -> ImageAnalysisOverlayView {
        return overlayView
    }

    func updateUIView(_ uiView: ImageAnalysisOverlayView, context: Context) {}
}
```

## 实战案例：仿 CapWords 实现

结合 VisionKit 和 Vision Framework，实现类似 CapWords 的物体识别应用。

```swift
import SwiftUI
import VisionKit
import Vision

@available(iOS 16.0, *)
struct ObjectRecognitionApp: View {
    @State private var showCamera = false
    @State private var capturedImage: UIImage?
    @State private var recognizedObjects: [RecognizedObject] = []
    @State private var isAnalyzing = false

    var body: some View {
        NavigationView {
            VStack {
                if let image = capturedImage {
                    // 显示拍摄的图片
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 300)
                        .cornerRadius(12)
                        .padding()

                    // 显示识别结果
                    if isAnalyzing {
                        ProgressView("正在识别...")
                            .padding()
                    } else if !recognizedObjects.isEmpty {
                        ScrollView {
                            VStack(alignment: .leading, spacing: 16) {
                                ForEach(recognizedObjects) { object in
                                    ObjectCard(object: object)
                                }
                            }
                            .padding()
                        }
                    }
                } else {
                    // 空状态
                    VStack(spacing: 20) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.gray)

                        Text("拍照识别物体")
                            .font(.title2)
                            .foregroundColor(.gray)
                    }
                }

                Spacer()

                // 拍照按钮
                Button(action: {
                    showCamera = true
                }) {
                    HStack {
                        Image(systemName: "camera")
                        Text("拍照识别")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("物体识别")
            .sheet(isPresented: $showCamera) {
                ImagePicker(image: $capturedImage)
            }
            .onChange(of: capturedImage) { newImage in
                if let image = newImage {
                    Task {
                        await analyzeImage(image)
                    }
                }
            }
        }
    }

    // 分析图片
    private func analyzeImage(_ image: UIImage) async {
        isAnalyzing = true
        recognizedObjects = []

        guard let cgImage = image.cgImage else {
            isAnalyzing = false
            return
        }

        // 1. 使用 Vision 进行物体分类
        let classifications = await classifyImage(cgImage)

        // 2. 检测显著性区域
        let salientObjects = await detectSalientObjects(cgImage)

        // 3. 组合结果
        recognizedObjects = classifications.prefix(5).map { classification in
            RecognizedObject(
                name: classification.identifier,
                confidence: classification.confidence,
                translation: translateToTargetLanguage(classification.identifier)
            )
        }

        isAnalyzing = false
    }

    // 图像分类
    private func classifyImage(_ cgImage: CGImage) async -> [VNClassificationObservation] {
        return await withCheckedContinuation { continuation in
            let request = VNClassifyImageRequest { request, error in
                guard let observations = request.results as? [VNClassificationObservation],
                      error == nil else {
                    continuation.resume(returning: [])
                    return
                }

                let filtered = observations.filter { $0.confidence > 0.3 }
                continuation.resume(returning: filtered)
            }

            let handler = VNImageRequestHandler(cgImage: cgImage)
            try? handler.perform([request])
        }
    }

    // 检测显著性对象
    private func detectSalientObjects(_ cgImage: CGImage) async -> [CGRect] {
        return await withCheckedContinuation { continuation in
            let request = VNGenerateAttentionBasedSaliencyImageRequest { request, error in
                guard let observation = request.results?.first as? VNSaliencyImageObservation,
                      error == nil else {
                    continuation.resume(returning: [])
                    return
                }

                let objects = observation.salientObjects?.map { $0.boundingBox } ?? []
                continuation.resume(returning: objects)
            }

            let handler = VNImageRequestHandler(cgImage: cgImage)
            try? handler.perform([request])
        }
    }

    // 翻译到目标语言（示例：这里需要集成翻译 API）
    private func translateToTargetLanguage(_ text: String) -> String {
        // 实际应用中应该调用翻译 API
        let translations: [String: String] = [
            "dog": "狗 🐕",
            "cat": "猫 🐱",
            "car": "汽车 🚗",
            "tree": "树 🌳",
            "book": "书 📚",
            "phone": "手机 📱",
            "cup": "杯子 ☕️"
        ]

        return translations[text.lowercased()] ?? text
    }
}

// 识别对象数据模型
struct RecognizedObject: Identifiable {
    let id = UUID()
    let name: String
    let confidence: Float
    let translation: String
}

// 对象卡片视图
struct ObjectCard: View {
    let object: RecognizedObject

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(object.translation)
                    .font(.title2)
                    .fontWeight(.bold)

                Text(object.name)
                    .font(.subheadline)
                    .foregroundColor(.gray)

                ProgressView(value: Double(object.confidence))
                    .progressViewStyle(.linear)

                Text("置信度: \(Int(object.confidence * 100))%")
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Spacer()

            Button(action: {
                speakWord(object.translation)
            }) {
                Image(systemName: "speaker.wave.2.fill")
                    .font(.title2)
                    .foregroundColor(.blue)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private func speakWord(_ word: String) {
        // 实现语音播放
        print("播放发音: \(word)")
    }
}

// 图片选择器
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.presentationMode) var presentationMode

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker

        init(_ parent: ImagePicker) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}
```

## 性能优化建议

### 1. 图像预处理

```swift
// 降低图片分辨率以提高处理速度
func resizeImage(_ image: UIImage, maxDimension: CGFloat) -> UIImage? {
    let size = image.size
    let scale = min(maxDimension / size.width, maxDimension / size.height)

    if scale >= 1 {
        return image
    }

    let newSize = CGSize(width: size.width * scale, height: size.height * scale)

    UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
    image.draw(in: CGRect(origin: .zero, size: newSize))
    let resizedImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()

    return resizedImage
}
```

### 2. 异步处理

```swift
// 使用异步操作避免阻塞主线程
func processImageAsync(_ image: UIImage) async -> [VNClassificationObservation] {
    await withCheckedContinuation { continuation in
        DispatchQueue.global(qos: .userInitiated).async {
            // 执行耗时操作
            let result = self.performVisionRequest(image)
            continuation.resume(returning: result)
        }
    }
}
```

### 3. 缓存和复用

```swift
// 缓存请求处理器
class VisionRequestManager {
    static let shared = VisionRequestManager()

    private var cachedRequests: [String: VNRequest] = [:]

    func getRequest(for type: String) -> VNRequest? {
        return cachedRequests[type]
    }

    func cacheRequest(_ request: VNRequest, for type: String) {
        cachedRequests[type] = request
    }
}
```

## 常见问题与解决方案

### Q1: 识别准确率低

```swift
// 解决方案：
// 1. 提高图片质量
// 2. 使用 accurate 模式
request.recognitionLevel = .accurate

// 3. 启用语言校正
request.usesLanguageCorrection = true

// 4. 指定正确的语言
request.recognitionLanguages = ["zh-Hans", "en-US"]
```

### Q2: 处理速度慢

```swift
// 解决方案：
// 1. 降低图片分辨率
let resizedImage = resizeImage(originalImage, maxDimension: 1024)

// 2. 使用 fast 模式
request.recognitionLevel = .fast

// 3. 限制识别区域
request.regionOfInterest = CGRect(x: 0.2, y: 0.2, width: 0.6, height: 0.6)
```

### Q3: 内存占用高

```swift
// 解决方案：
// 1. 及时释放资源
autoreleasepool {
    let handler = VNImageRequestHandler(cgImage: cgImage)
    try? handler.perform([request])
}

// 2. 批量处理时限制并发数
let queue = OperationQueue()
queue.maxConcurrentOperationCount = 2
```

## 最佳实践总结

### 使用建议

```swift
✅ VisionKit 适用场景：
- 需要标准 UI 的文档扫描
- 实时相机识别（文字、条形码）
- Live Text 功能
- 快速原型开发

✅ Vision Framework 适用场景：
- 需要精细控制识别流程
- 批量图像处理
- 自定义 Core ML 模型
- 复杂的图像分析任务

✅ 混合使用：
- VisionKit 用于用户交互
- Vision Framework 用于后台处理
- 结合使用发挥各自优势
```

### 代码规范

```swift
// 1. 始终检查设备支持
guard VNDocumentCameraViewController.isSupported else {
    // 降级处理
    return
}

// 2. 异步处理避免阻塞
Task {
    await processImage(image)
}

// 3. 错误处理
do {
    try handler.perform([request])
} catch {
    print("处理失败: \(error)")
}

// 4. 内存管理
autoreleasepool {
    // 处理大量图片
}
```

## 总结

### VisionKit vs Vision Framework

| 特性 | VisionKit | Vision Framework |
|------|-----------|------------------|
| **抽象层级** | 高层 UI 组件 | 底层算法框架 |
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **定制性** | 低 | 高 |
| **学习曲线** | 平缓 | 陡峭 |
| **适用场景** | 标准功能快速实现 | 复杂需求精细控制 |

### 核心要点

1. **VisionKit**
   - 提供完整的 UI 组件
   - 快速实现标准功能
   - 系统级用户体验
   - 适合快速开发

2. **Vision Framework**
   - 强大的底层能力
   - 高度可定制
   - 支持 Core ML
   - 适合复杂场景

3. **最佳实践**
   - 根据需求选择合适的框架
   - 注意性能优化
   - 做好错误处理
   - 异步处理避免阻塞

通过合理使用 VisionKit 和 Vision Framework，你可以构建出功能强大、体验优秀的视觉识别应用！🚀
