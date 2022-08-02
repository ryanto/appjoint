import React, { ReactNode } from 'react';

export type Plugin = {
  props?: object;
  provider?: any;
};

type PluginProps = {
  plugins?: Plugin[];
  children: ReactNode;
};

export const Plugins = ({ plugins = [], children }: PluginProps) => {
  let [first, ...rest] = plugins;

  return first ? (
    <PluginProvider plugin={first}>
      <Plugins plugins={rest}>{children}</Plugins>
    </PluginProvider>
  ) : (
    <>{children}</>
  );
};

type ProviderPluginProps = {
  plugin: Plugin;
  children: ReactNode;
};

let PluginProvider = ({ plugin, children }: ProviderPluginProps) => {
  let Provider = plugin.provider;
  return <Provider {...plugin.props} children={children} />;
};
