import React from 'react';

export type Plugin = {
  props?: object;
  provider?: any;
};

export const Plugins: React.FC<{ plugins: Plugin[] }> = ({
  plugins,
  children,
}): React.ReactElement => {
  let [first, ...rest] = plugins;

  return (
    <PluginProvider plugin={first}>
      {rest.length > 0 ? (
        <Plugins plugins={rest}>{children}</Plugins>
      ) : (
        <>{children}</>
      )}
    </PluginProvider>
  );
};

let PluginProvider: React.FC<{ plugin: Plugin }> = ({
  plugin,
  children,
}): React.ReactElement => {
  let Provider = plugin.provider;
  return <Provider {...plugin.props} children={children} />;
};
