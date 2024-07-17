# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := opus
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=opus' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_DARWIN_USE_64_BIT_INODE=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DLARGEFILE_SOURCE' \
	'-DWEBRTC_TARGET_PC' \
	'-DWEBRTC_LINUX' \
	'-DWEBRTC_THREAD_RR' \
	'-DEXPAT_RELATIVE_PATH' \
	'-DGTEST_RELATIVE_PATH' \
	'-DJSONCPP_RELATIVE_PATH' \
	'-DWEBRTC_RELATIVE_PATH' \
	'-DPOSIX,__STDC_FORMAT_MACROS' \
	'-DDYNAMIC_ANNOTATIONS_ENABLED=0' \
	'-DNAPI_DISABLE_CPP_EXCEPTIONS' \
	'-DNAPI_VERSION=3' \
	'-DBUILDING_NODE_EXTENSION' \
	'-DDEBUG' \
	'-D_DEBUG'

# Flags passed to all source files.
CFLAGS_Debug := \
	-O0 \
	-gdwarf-2 \
	-mmacosx-version-min=10.15 \
	-arch arm64 \
	-Wall \
	-Wendif-labels \
	-W \
	-Wno-unused-parameter

# Flags passed to only C files.
CFLAGS_C_Debug := \
	-fno-strict-aliasing

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-std=gnu++17 \
	-stdlib=libc++ \
	-fno-rtti \
	-fno-exceptions \
	-fno-strict-aliasing

# Flags passed to only ObjC files.
CFLAGS_OBJC_Debug :=

# Flags passed to only ObjC++ files.
CFLAGS_OBJCC_Debug :=

INCS_Debug := \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/include/node \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/src \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/openssl/config \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/openssl/openssl/include \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/uv/include \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/zlib \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/v8/include \
	-I/Users/javierjar/Downloads/evobot-master/node_modules/node-addon-api

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=opus' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_DARWIN_USE_64_BIT_INODE=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DLARGEFILE_SOURCE' \
	'-DWEBRTC_TARGET_PC' \
	'-DWEBRTC_LINUX' \
	'-DWEBRTC_THREAD_RR' \
	'-DEXPAT_RELATIVE_PATH' \
	'-DGTEST_RELATIVE_PATH' \
	'-DJSONCPP_RELATIVE_PATH' \
	'-DWEBRTC_RELATIVE_PATH' \
	'-DPOSIX,__STDC_FORMAT_MACROS' \
	'-DDYNAMIC_ANNOTATIONS_ENABLED=0' \
	'-DNAPI_DISABLE_CPP_EXCEPTIONS' \
	'-DNAPI_VERSION=3' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
CFLAGS_Release := \
	-O3 \
	-gdwarf-2 \
	-mmacosx-version-min=10.15 \
	-arch arm64 \
	-Wall \
	-Wendif-labels \
	-W \
	-Wno-unused-parameter

# Flags passed to only C files.
CFLAGS_C_Release := \
	-fno-strict-aliasing

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-std=gnu++17 \
	-stdlib=libc++ \
	-fno-rtti \
	-fno-exceptions \
	-fno-strict-aliasing

# Flags passed to only ObjC files.
CFLAGS_OBJC_Release :=

# Flags passed to only ObjC++ files.
CFLAGS_OBJCC_Release :=

INCS_Release := \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/include/node \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/src \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/openssl/config \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/openssl/openssl/include \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/uv/include \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/zlib \
	-I/Users/javierjar/Library/Caches/node-gyp/20.15.1/deps/v8/include \
	-I/Users/javierjar/Downloads/evobot-master/node_modules/node-addon-api

OBJS := \
	$(obj).target/$(TARGET)/src/node-opus.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# Make sure our dependencies are built before any of us.
$(OBJS): | $(builddir)/opus.a

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))
$(OBJS): GYP_OBJCFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE)) $(CFLAGS_OBJC_$(BUILDTYPE))
$(OBJS): GYP_OBJCXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE)) $(CFLAGS_OBJCC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.cc FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-undefined dynamic_lookup \
	-Wl,-search_paths_first \
	-mmacosx-version-min=10.15 \
	-arch arm64 \
	-L$(builddir) \
	-stdlib=libc++

LIBTOOLFLAGS_Debug := \
	-undefined dynamic_lookup \
	-Wl,-search_paths_first

LDFLAGS_Release := \
	-undefined dynamic_lookup \
	-Wl,-search_paths_first \
	-mmacosx-version-min=10.15 \
	-arch arm64 \
	-L$(builddir) \
	-stdlib=libc++

LIBTOOLFLAGS_Release := \
	-undefined dynamic_lookup \
	-Wl,-search_paths_first

LIBS :=

/Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
/Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node: LIBS := $(LIBS)
/Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node: GYP_LIBTOOLFLAGS := $(LIBTOOLFLAGS_$(BUILDTYPE))
/Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node: TOOLSET := $(TOOLSET)
/Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node: $(OBJS) $(builddir)/opus.a FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += /Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node
# Add target alias
.PHONY: opus
opus: $(builddir)/opus.node

# Copy this to the executable output path.
$(builddir)/opus.node: TOOLSET := $(TOOLSET)
$(builddir)/opus.node: /Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/opus.node
# Short alias for building this executable.
.PHONY: opus.node
opus.node: /Users/javierjar/Downloads/evobot-master/node_modules/@discordjs/opus/prebuild/node-v115-napi-v3-darwin-arm64-unknown-unknown/opus.node $(builddir)/opus.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/opus.node

