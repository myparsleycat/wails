//go:build windows

package w32

import (
	"errors"
	"golang.org/x/sys/windows"
	"syscall"
	"unsafe"
)

type IDataObjectVtbl struct {
	IUnknownVtbl
	GetData               ComProc
	GetDataHere           ComProc
	QueryGetData          ComProc
	GetCanonicalFormatEtc ComProc
	SetData               ComProc
	EnumFormatEtc         ComProc
	DAdvise               ComProc
}

type IDataObject struct {
	Vtbl *IDataObjectVtbl
}

func (i *IDataObject) AddRef() uintptr {
	refCounter, _, _ := i.Vtbl.AddRef.Call(uintptr(unsafe.Pointer(i)))
	return refCounter
}

func (i *IDataObject) GetData(formatEtc *FORMATETC, medium *STGMEDIUM) error {
	hr, _, err := i.Vtbl.GetData.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(unsafe.Pointer(formatEtc)),
		uintptr(unsafe.Pointer(medium)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return syscall.Errno(hr)
	}
	return err
}

func (i *IDataObject) GetDataHere(formatEtc *FORMATETC, medium *STGMEDIUM) error {
	hr, _, err := i.Vtbl.GetDataHere.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(unsafe.Pointer(formatEtc)),
		uintptr(unsafe.Pointer(medium)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return syscall.Errno(hr)
	}
	return err
}

func (i *IDataObject) QueryGetData(formatEtc *FORMATETC) error {
	hr, _, err := i.Vtbl.QueryGetData.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(unsafe.Pointer(formatEtc)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return syscall.Errno(hr)
	}
	return err
}

func (i *IDataObject) GetCanonicalFormatEtc(inputFormatEtc *FORMATETC, outputFormatEtc *FORMATETC) error {
	hr, _, err := i.Vtbl.GetCanonicalFormatEtc.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(unsafe.Pointer(inputFormatEtc)),
		uintptr(unsafe.Pointer(outputFormatEtc)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return syscall.Errno(hr)
	}
	return err
}

func (i *IDataObject) SetData(formatEtc *FORMATETC, medium *STGMEDIUM, release bool) error {
	hr, _, err := i.Vtbl.SetData.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(unsafe.Pointer(formatEtc)),
		uintptr(unsafe.Pointer(medium)),
		uintptr(BoolToBOOL(release)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return syscall.Errno(hr)
	}
	return err
}

func (i *IDataObject) EnumFormatEtc(dwDirection uint32, enumFormatEtc **IEnumFORMATETC) error {
	hr, _, err := i.Vtbl.EnumFormatEtc.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(dwDirection),
		uintptr(unsafe.Pointer(enumFormatEtc)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return syscall.Errno(hr)
	}
	return err
}

func (i *IDataObject) DAdvise(formatEtc *FORMATETC, advf uint32, adviseSink *IAdviseSink, pdwConnection *uint32) error {
	hr, _, err := i.Vtbl.DAdvise.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(unsafe.Pointer(formatEtc)),
		uintptr(advf),
		uintptr(unsafe.Pointer(adviseSink)),
		uintptr(unsafe.Pointer(pdwConnection)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return syscall.Errno(hr)
	}
	return err
}

// SupportsFileDrop reports whether the data object exposes Windows' CF_HDROP
// format, which contains paths for files dragged from Explorer and compatible
// shell data sources.
func (i *IDataObject) SupportsFileDrop() bool {
	if i == nil {
		return false
	}
	err := i.QueryGetData(fileDropFormat())
	return err == nil || errors.Is(err, windows.ERROR_SUCCESS)
}

// FileDropPaths extracts file paths from a CF_HDROP data object.
func (i *IDataObject) FileDropPaths() ([]string, error) {
	if i == nil {
		return nil, errors.New("file drop data object is nil")
	}

	var medium STGMEDIUM
	if err := i.GetData(fileDropFormat(), &medium); err != nil && !errors.Is(err, windows.ERROR_SUCCESS) {
		return nil, err
	}
	defer medium.Release()

	hDrop := medium.Union
	_, count := DragQueryFile(hDrop, 0xFFFFFFFF)
	paths := make([]string, 0, count)
	for index := uint(0); index < count; index++ {
		path, _ := DragQueryFile(hDrop, index)
		paths = append(paths, path)
	}
	return paths, nil
}

func fileDropFormat() *FORMATETC {
	return &FORMATETC{
		CfFormat: CF_HDROP,
		Tymed:    TYMED_HGLOBAL,
	}
}

type DVTargetDevice struct {
	TdSize             uint32
	TdDriverNameOffset uint16
	TdDeviceNameOffset uint16
	TdPortNameOffset   uint16
	TdExtDevmodeOffset uint16
	TdData             [1]byte
}

type FORMATETC struct {
	CfFormat uint16
	Ptd      *DVTargetDevice
	DwAspect uint32
	Lindex   int32
	Tymed    Tymed
}

type Tymed uint32

const (
	TYMED_HGLOBAL  Tymed = 1
	TYMED_FILE     Tymed = 2
	TYMED_ISTREAM  Tymed = 4
	TYMED_ISTORAGE Tymed = 8
	TYMED_GDI      Tymed = 16
	TYMED_MFPICT   Tymed = 32
	TYMED_ENHMF    Tymed = 64
	TYMED_NULL     Tymed = 0
)

type STGMEDIUM struct {
	Tymed          Tymed
	Union          uintptr
	PUnkForRelease IUnknownImpl
}

func (s STGMEDIUM) FileName() string {
	if s.Tymed != TYMED_FILE {
		return ""
	}
	return windows.UTF16PtrToString((*uint16)(unsafe.Pointer(s.Union)))
}

func (s STGMEDIUM) Release() {
	if s.PUnkForRelease != nil {
		s.PUnkForRelease.Release()
	}
}

type IEnumFORMATETC struct{}
type IAdviseSink struct{}
type IEnumStatData struct{}
